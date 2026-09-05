import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreenShowcaseSection } from "@/components/Launcher/ScreenShowcaseSection";
import { renderWithProviders } from "@/utils/test-utils";

describe("Launcher/ScreenShowcaseSection Component", () => {
  it("renders section header and badge", () => {
    renderWithProviders(<ScreenShowcaseSection />);

    expect(
      screen.getByText("EXPERIENCIA DE PANTALLAS UI/UX"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Diseñado Pantalla a Pantalla para la Élite/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders all 6 screen selector buttons", () => {
    renderWithProviders(<ScreenShowcaseSection />);

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getByText("06")).toBeInTheDocument();
  });

  it("displays the first screen (Launch Hub) by default", () => {
    renderWithProviders(<ScreenShowcaseSection />);

    expect(screen.getByText("PANTALLA 01")).toBeInTheDocument();
    expect(screen.getByText("CORE ENGINE")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Launch Hub & Play Deck",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("AlexGamer99 👑")).toBeInTheDocument();
  });

  it("switches screens when clicking on selector buttons", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScreenShowcaseSection />);

    // Click on Screen 02 (Version Matrix Switcher)
    const versionBtn = screen.getByText("02").closest("button");
    expect(versionBtn).not.toBeNull();
    await user.click(versionBtn!);

    expect(screen.getByText("PANTALLA 02")).toBeInTheDocument();
    expect(screen.getByText("VERSION HUB")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Version Matrix Switcher",
      }),
    ).toBeInTheDocument();

    // Click on Screen 03 (Mod & Shader Center)
    const modBtn = screen.getByText("03").closest("button");
    await user.click(modBtn!);

    expect(screen.getByText("PANTALLA 03")).toBeInTheDocument();
    expect(screen.getByText("MOD ENGINE")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Mod & Shader Center",
      }),
    ).toBeInTheDocument();

    // Click on Screen 06 (Crash Reporter & Diagnostics)
    const crashBtn = screen.getByText("06").closest("button");
    await user.click(crashBtn!);

    expect(screen.getByText("PANTALLA 06")).toBeInTheDocument();
    expect(screen.getByText("DIAGNOSTICS")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Crash Reporter & Diagnostics",
      }),
    ).toBeInTheDocument();
  });
});
