import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import HeroBackgroundCarousel from "@/components/Hero/Carousel";
import { renderWithProviders } from "@/utils/test-utils";

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), {}],
}));

vi.mock("embla-carousel-autoplay", () => ({
  default: vi.fn(),
}));

vi.mock("embla-carousel-fade", () => ({
  default: vi.fn(),
}));

describe("HeroBackgroundCarousel", () => {
  const mockCustomSlides = [
    {
      image: "https://example.com/slide1.webp",
      title: "Epic World",
      text: "Join the ultimate SMP adventure.",
      buttonText: "Play Now",
      link: "/play",
    },
  ];

  it("renders custom slides with title, description text, and action button", () => {
    renderWithProviders(<HeroBackgroundCarousel slides={mockCustomSlides} />);

    expect(screen.getByText("Epic World")).toBeInTheDocument();
    expect(
      screen.getByText("Join the ultimate SMP adventure.")
    ).toBeInTheDocument();

    const linkBtn = screen.getByRole("link", { name: "Play Now" });
    expect(linkBtn).toBeInTheDocument();
    expect(linkBtn).toHaveAttribute("href", "/play");
  });

  it("renders default background carousel images when no slides are provided", () => {
    const { container } = renderWithProviders(<HeroBackgroundCarousel />);

    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute("src", "/images/backgrounds/hero-bg-1.webp");
  });
});
