import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { PlayerStatsWidget } from "@/components/Launcher/PlayerStatsWidget";

describe("PlayerStatsWidget Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              username: "Steve",
              rank: "Aventurero",
              rank_image: "user.png",
              playtime: "142h 30m",
              weekly_playtime: "8h 45m",
              kills: 154,
              weekly_kills: 18,
              mob_kills: 1420,
              deaths: 23,
              weekly_deaths: 3,
              money: "1,250 KC",
              weekly_kc_earned: "+350 KC",
              gacha_spins_weekly: 4,
              blocks_mined: 38900,
              blocks_placed: 45210,
              member_since: "14 de Febrero, 2026",
            },
          }),
      }),
    );
  });

  it("returns null when username is null or undefined", () => {
    const { container } = renderWithProviders(
      <PlayerStatsWidget username={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders player profile header, rank, and username", async () => {
    renderWithProviders(<PlayerStatsWidget username="Steve" />);

    await waitFor(() => {
      expect(screen.getByText("Steve")).toBeInTheDocument();
      expect(screen.getByText(/Aventurero/i)).toBeInTheDocument();
    });
  });

  it("renders the 5 pentagon radar axes (Constructor, Luchador, Mercader, Constancia, Explorador)", async () => {
    renderWithProviders(<PlayerStatsWidget username="Steve" />);

    await waitFor(() => {
      expect(screen.getByText(/Radar de Estilo de Juego/i)).toBeInTheDocument();
      expect(screen.getAllByText("Constructor").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Luchador").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Mercader").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Constancia").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Explorador").length).toBeGreaterThan(0);
    });
  });

  it("renders fallback stats if API fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    renderWithProviders(<PlayerStatsWidget username="Alex" />);

    await waitFor(() => {
      expect(screen.getByText("Alex")).toBeInTheDocument();
      expect(screen.getByText(/Aventurero/i)).toBeInTheDocument();
    });
  });
});
