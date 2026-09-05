import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainLayout } from "@/components/Launcher/MainLayout";
import { renderWithProviders } from "@/utils/test-utils";

// Mock subpages to isolate MainLayout navigation & modal coordination
vi.mock("@/components/Launcher/HomePage", () => ({
  HomePage: ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div data-testid="page-home">
      <span>Mock HomePage</span>
      <button onClick={() => onNavigate("settings")}>Go to Settings</button>
    </div>
  ),
}));

vi.mock("@/components/Launcher/ProfileManagerPage", () => ({
  ProfileManagerPage: () => (
    <div data-testid="page-profiles">Mock ProfileManagerPage</div>
  ),
}));

vi.mock("@/components/Launcher/ModManagerPage", () => ({
  ModManagerPage: () => <div data-testid="page-mods">Mock ModManagerPage</div>,
}));

vi.mock("@/components/Launcher/NewsPage", () => ({
  NewsPage: () => <div data-testid="page-news">Mock NewsPage</div>,
}));

vi.mock("@/components/Launcher/SettingsPage", () => ({
  SettingsPage: () => <div data-testid="page-settings">Mock SettingsPage</div>,
}));

vi.mock("@/components/Launcher/LogsPage", () => ({
  LogsPage: () => <div data-testid="page-logs">Mock LogsPage</div>,
}));

vi.mock("@/components/Launcher/RewardsPage", () => ({
  RewardsPage: () => <div data-testid="page-rewards">Mock RewardsPage</div>,
}));

vi.mock("@/components/Launcher/PlayerStatsWidget", () => ({
  PlayerStatsWidget: ({ username }: { username: string }) => (
    <div data-testid="page-stats-widget">Stats for {username}</div>
  ),
}));

vi.mock("@/components/Launcher/AccountSwitcherModal", () => ({
  AccountSwitcherModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="modal-account-switcher">
      <button onClick={onClose}>Close Account Switcher</button>
    </div>
  ),
}));

vi.mock("@/components/Launcher/SocialPanel", () => ({
  SocialPanel: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="panel-social">
        <button onClick={onClose}>Close Social</button>
      </div>
    ) : null,
}));

vi.mock("@/components/Launcher/VersionSwitcherModal", () => ({
  VersionSwitcherModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="modal-version-switcher">
      <button onClick={onClose}>Close Versions</button>
    </div>
  ),
}));

vi.mock("@/components/Launcher/CrashModal", () => ({
  CrashModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="modal-crash">
        <button onClick={onClose}>Close Crash</button>
      </div>
    ) : null,
}));

let mockCrystalSession: Record<string, unknown> | null = null;
let mockCurrentSession: Record<string, unknown> | null = null;

vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useAuth: () => ({
      currentSession: mockCurrentSession,
      crystalSession: mockCrystalSession,
      logout: vi.fn(),
    }),
    getSettings: () => ({ avatarPreference: "web" }),
  };
});

describe("Launcher/MainLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCrystalSession = {
      username: "AlexCrystal",
      email: "alex@crystal.smp",
      avatarUrl: "https://example.com/avatar.png",
      role: "captain",
    };
    mockCurrentSession = {
      id: "session-1",
      username: "AlexMinecraft",
      type: "crystal",
    };
  });

  it("renders sidebar navigation items and default HomePage", () => {
    renderWithProviders(<MainLayout />);

    expect(screen.getByTitle("Inicio")).toBeInTheDocument();
    expect(screen.getByTitle("Perfiles")).toBeInTheDocument();
    expect(screen.getByTitle("Mods")).toBeInTheDocument();
    expect(screen.getByTitle("Noticias")).toBeInTheDocument();
    expect(screen.getByTitle("Ajustes")).toBeInTheDocument();
    expect(screen.getByTitle("Logs")).toBeInTheDocument();
    expect(screen.getByTitle("Recompensas")).toBeInTheDocument();
    expect(screen.getByTitle("Estadísticas")).toBeInTheDocument();
    expect(screen.getByTitle("Selector de Versiones")).toBeInTheDocument();

    expect(screen.getByTestId("page-home")).toBeInTheDocument();
  });

  it("navigates to different pages when clicking sidebar items", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);

    // Navigate to Profiles
    await user.click(screen.getByTitle("Perfiles"));
    expect(screen.getByTestId("page-profiles")).toBeInTheDocument();

    // Navigate to Mods
    await user.click(screen.getByTitle("Mods"));
    expect(screen.getByTestId("page-mods")).toBeInTheDocument();

    // Navigate to News
    await user.click(screen.getByTitle("Noticias"));
    expect(screen.getByTestId("page-news")).toBeInTheDocument();

    // Navigate to Settings
    await user.click(screen.getByTitle("Ajustes"));
    expect(screen.getByTestId("page-settings")).toBeInTheDocument();

    // Navigate to Logs
    await user.click(screen.getByTitle("Logs"));
    expect(screen.getByTestId("page-logs")).toBeInTheDocument();

    // Navigate to Rewards
    await user.click(screen.getByTitle("Recompensas"));
    expect(screen.getByTestId("page-rewards")).toBeInTheDocument();

    // Return to Home by clicking Logo
    await user.click(screen.getByTitle("CrystalTides Launcher"));
    expect(screen.getByTestId("page-home")).toBeInTheDocument();
  });

  it("renders stats page with widget when crystal session is active", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);

    await user.click(screen.getByTitle("Estadísticas"));
    expect(screen.getByText("📊 Estadísticas del Jugador")).toBeInTheDocument();
    expect(screen.getByTestId("page-stats-widget")).toBeInTheDocument();
    expect(screen.getByText("Stats for AlexCrystal")).toBeInTheDocument();
  });

  it("renders auth required card on stats page when no crystal session", async () => {
    mockCrystalSession = null;
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);

    await user.click(screen.getByTitle("Estadísticas"));
    expect(screen.getByText("Autenticación Requerida")).toBeInTheDocument();
    expect(screen.queryByTestId("page-stats-widget")).not.toBeInTheDocument();
  });

  it("opens and closes VersionSwitcherModal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);

    await user.click(screen.getByTitle("Selector de Versiones"));
    expect(screen.getByTestId("modal-version-switcher")).toBeInTheDocument();

    await user.click(screen.getByText("Close Versions"));
    expect(
      screen.queryByTestId("modal-version-switcher"),
    ).not.toBeInTheDocument();
  });

  it("opens and closes SocialPanel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);

    await user.click(screen.getByTitle("Amigos en Línea"));
    expect(screen.getByTestId("panel-social")).toBeInTheDocument();

    await user.click(screen.getByText("Close Social"));
    expect(screen.queryByTestId("panel-social")).not.toBeInTheDocument();
  });

  it("opens and closes CrashModal via simulation button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);

    await user.click(screen.getByTitle("Simular Diagnóstico de Crash"));
    expect(screen.getByTestId("modal-crash")).toBeInTheDocument();

    await user.click(screen.getByText("Close Crash"));
    expect(screen.queryByTestId("modal-crash")).not.toBeInTheDocument();
  });

  it("opens and closes AccountSwitcherModal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);

    await user.click(screen.getByTitle("Cambiar de Cuenta"));
    expect(screen.getByTestId("modal-account-switcher")).toBeInTheDocument();

    await user.click(screen.getByText("Close Account Switcher"));
    expect(
      screen.queryByTestId("modal-account-switcher"),
    ).not.toBeInTheDocument();
  });
});
