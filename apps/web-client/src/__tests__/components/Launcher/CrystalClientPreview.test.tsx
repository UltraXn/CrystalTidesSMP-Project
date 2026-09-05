import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { CrystalClientPreview } from "@/components/Launcher/CrystalClientPreview";
import { renderWithProviders } from "@/utils/test-utils";

describe("Launcher/CrystalClientPreview Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("renders top title bar with build and online count", () => {
    renderWithProviders(<CrystalClientPreview />);

    expect(screen.getByText("CrystalTides Client")).toBeInTheDocument();
    expect(screen.getByText("Build 2.4.0")).toBeInTheDocument();
    expect(screen.getByText("9,101 Online")).toBeInTheDocument();
  });

  it("renders user greeting and launch button", () => {
    renderWithProviders(<CrystalClientPreview />);

    expect(screen.getByText("AlexGamer99")).toBeInTheDocument();
    expect(screen.getByText("LAUNCH")).toBeInTheDocument();
    expect(screen.getByText("Fabric 🔖 1.21.3")).toBeInTheDocument();
  });

  it("handles launch button click and simulated download progress", () => {
    renderWithProviders(<CrystalClientPreview />);

    const launchBtn = screen.getByText("LAUNCH").closest("button");
    expect(launchBtn).not.toBeNull();

    act(() => {
      fireEvent.click(launchBtn!);
    });

    // While downloading, text switches to SYNCING
    expect(screen.getByText(/SYNCING|READY/)).toBeInTheDocument();

    // Advance timers through download
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("READY")).toBeInTheDocument();

    // After finish delay, resets to LAUNCH
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByText("LAUNCH")).toBeInTheDocument();
  });

  it("switches selected profile between CrystalTides SMP and Hypixel Bedwars", () => {
    renderWithProviders(<CrystalClientPreview />);

    const hypixelProfile = screen.getByText("Hypixel Bedwars");
    fireEvent.click(hypixelProfile);

    const smpProfiles = screen.getAllByText("CrystalTides SMP");
    fireEvent.click(smpProfiles[smpProfiles.length - 1]);
  });

  it("filters friends list by search query", () => {
    renderWithProviders(<CrystalClientPreview />);

    expect(screen.getByText("172px")).toBeInTheDocument();
    expect(screen.getByText("daaaavidds")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Find a player...");
    fireEvent.change(searchInput, { target: { value: "172" } });

    expect(screen.getByText("172px")).toBeInTheDocument();
    expect(screen.queryByText("daaaavidds")).not.toBeInTheDocument();
  });

  it("switches active navigation icons on the left sidebar", () => {
    renderWithProviders(<CrystalClientPreview />);

    const profilesNav = screen.getByTitle("Profiles / Perfiles");
    fireEvent.click(profilesNav);

    const modsNav = screen.getByTitle("Gestor de Mods");
    fireEvent.click(modsNav);
  });
});
