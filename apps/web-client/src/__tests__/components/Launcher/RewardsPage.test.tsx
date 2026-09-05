import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RewardsPage } from "@/components/Launcher/RewardsPage";
import { renderWithProviders } from "@/utils/test-utils";

// Mock useAuth from mockLauncherState
vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useAuth: () => ({
      currentSession: {
        id: "test-user-123",
        username: "AlexGamer",
        type: "crystal",
      },
    }),
  };
});

const MOCK_CONFIG = [
  {
    day: 1,
    title: "Día 1",
    reward_type: "killucoins" as const,
    reward_value: 25,
    multiplier: 1,
  },
  {
    day: 7,
    title: "Día 7: Cofre de Cobre",
    reward_type: "killucoins" as const,
    reward_value: 175,
    multiplier: 1,
  },
  {
    day: 14,
    title: "Día 14: Cofre de Plata",
    reward_type: "killucoins" as const,
    reward_value: 350,
    multiplier: 2,
  },
  {
    day: 30,
    title: "Día 30: 👑 JACKPOT IRIDIUM X50",
    reward_type: "achievement" as const,
    reward_value: 750,
    multiplier: 50,
    is_jackpot: true,
  },
];

const MOCK_STREAK = {
  currentStreak: 5,
  canClaim: true,
  hasLegendaryAchievement: false,
  prestigeLevel: 2,
  streakShields: 3,
};

describe("Launcher/RewardsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/roadmap/config")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: MOCK_CONFIG }),
        });
      }
      if (urlStr.includes("/api/roadmap/streak")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: MOCK_STREAK }),
        });
      }
      if (urlStr.includes("/api/roadmap/claim")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { message: "Recompensa reclamada con éxito", newBalance: 1500 },
            }),
        });
      }
      return Promise.reject(new Error("Unhandled URL"));
    });
  });

  it("renders header banner and streak details", async () => {
    renderWithProviders(<RewardsPage />);

    expect(
      screen.getByText("Recompensas Diarias & Roadmap Mensual"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Prestigio Plata (+30% KC)")).toBeInTheDocument();
    });
    expect(screen.getByText("Escudos: 3")).toBeInTheDocument();
    expect(screen.getByText("Racha: Día 5 / 30")).toBeInTheDocument();
  });

  it("renders week filter tabs and responds to tab switching", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RewardsPage />);

    expect(screen.getByText("Todo el Mes (30 Días)")).toBeInTheDocument();
    expect(screen.getByText("Semana 1 (Días 1-7)")).toBeInTheDocument();
    expect(screen.getByText("Semana 2 (Días 8-14)")).toBeInTheDocument();

    const week1Tab = screen.getByText("Semana 1 (Días 1-7)");
    await user.click(week1Tab);

    expect(
      screen.getByText(/Inicio de Racha & Botín de Cobre/),
    ).toBeInTheDocument();
  });

  it("handles claiming daily reward successfully", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RewardsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Reclamar recompensa del día 5",
        }),
      ).toBeInTheDocument();
    });

    const claimBtn = screen.getByRole("button", {
      name: "Reclamar recompensa del día 5",
    });
    expect(claimBtn).not.toBeDisabled();
    await user.click(claimBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/¡Recompensa reclamada con éxito! Nuevo Saldo: 1500 KC/),
      ).toBeInTheDocument();
    });
  });

  it("renders legendary achievement banner when earned", async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/roadmap/streak")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                ...MOCK_STREAK,
                hasLegendaryAchievement: true,
                canClaim: false,
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: MOCK_CONFIG }),
      });
    });

    renderWithProviders(<RewardsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/🏆 ¡LOGRO MÁXIMO DESBLOQUEADO: Leyenda de CrystalTides!/),
      ).toBeInTheDocument();
    });

    const claimBtn = screen.getByRole("button", {
      name: "Recompensa de hoy ya reclamada",
    });
    expect(claimBtn).toBeDisabled();
  });

  it("falls back to offline preview days if API request fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Offline"));
    renderWithProviders(<RewardsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Calendario Mensual Completo (30 Días)"),
      ).toBeInTheDocument();
    });
  });
});
