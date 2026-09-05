import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import Hero from "@/components/Hero";
import { renderWithProviders } from "@/utils/test-utils";

vi.mock("@/components/Hero/Carousel", () => ({
  default: () => <div data-testid="mock-hero-carousel" />,
}));

vi.mock("@/components/Hero/Particles", () => ({
  default: () => <div data-testid="mock-hero-particles" />,
}));

describe("Hero", () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockWriteText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders brand title, server ip, launcher link and online players status", () => {
    renderWithProviders(
      <Hero mockIsOnline={true} mockPlayerCount={42} mockSlides={[]} />
    );

    expect(screen.getByText("BIENVENIDO A")).toBeInTheDocument();
    expect(screen.getByText("mc.crystaltidessmp.net")).toBeInTheDocument();
    expect(screen.getByText(/42 Jugadores Online/i)).toBeInTheDocument();

    const launcherLink = screen.getByRole("link", { name: /launcher oficial/i });
    expect(launcherLink).toHaveAttribute("href", "/launcher");
  });

  it("copies server IP to clipboard on copy button click", () => {
    renderWithProviders(
      <Hero mockIsOnline={true} mockPlayerCount={10} mockSlides={[]} />
    );

    const copyBtn = screen.getByRole("button", { name: /copiar ip/i });
    fireEvent.click(copyBtn);

    expect(mockWriteText).toHaveBeenCalledWith("mc.crystaltidessmp.net");
  });

  it("renders offline status correctly when mockIsOnline is false", () => {
    renderWithProviders(
      <Hero mockIsOnline={false} mockPlayerCount={0} mockSlides={[]} />
    );

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });
});
