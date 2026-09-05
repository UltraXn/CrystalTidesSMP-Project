import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import PlayerStatsGrid from "@/components/User/PlayerStatsGrid";
import { renderWithProviders } from "@/utils/test-utils";

vi.mock("@/components/Account/PlaystyleRadarFinal", () => ({
  default: ({ stats }: { stats: Record<string, unknown> }) => (
    <div data-testid="mock-playstyle-radar" data-stats={JSON.stringify(stats)}>
      Radar Chart
    </div>
  ),
}));

describe("PlayerStatsGrid", () => {
  const sampleStats = {
    playtime: "10h 30m",
    kills: 42,
    mob_kills: 120,
    deaths: 5,
    money: "$1,500.50",
    blocks_mined: "2500",
    blocks_placed: "1800",
    rank: "Diamond",
  };

  it("renders private message when stats are not public and viewer is not admin", () => {
    renderWithProviders(
      <PlayerStatsGrid
        stats={sampleStats}
        loading={false}
        isPublic={false}
        isAdmin={false}
      />
    );

    expect(
      screen.getByText(/mantiene su estilo de juego en privado|private/i)
    ).toBeInTheDocument();
  });

  it("renders radar chart when stats are public and loaded", async () => {
    renderWithProviders(
      <PlayerStatsGrid
        stats={sampleStats}
        loading={false}
        isPublic={true}
        isAdmin={false}
      />
    );

    const radar = await screen.findByTestId("mock-playstyle-radar");
    expect(radar).toBeInTheDocument();
  });

  it("renders error state when stats are null and not loading", () => {
    renderWithProviders(
      <PlayerStatsGrid
        stats={null}
        loading={false}
        isPublic={true}
        isAdmin={false}
      />
    );

    expect(
      screen.getByText(/No se pudieron cargar los datos de estilo/i)
    ).toBeInTheDocument();
  });
});
