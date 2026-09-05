import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSwitcherModal } from "@/components/Launcher/AccountSwitcherModal";
import { renderWithProviders } from "@/utils/test-utils";

const mockSelectAccount = vi.fn();
const mockRemoveAccount = vi.fn();
const mockLogout = vi.fn();
const mockSaveSettings = vi.fn();
let mockCurrentSession: Record<string, unknown> | null = {
  id: "acc-1",
  username: "PlayerOne",
  type: "microsoft",
};
let mockCrystalSession: Record<string, unknown> | null = {
  username: "CrystalMaster",
  email: "master@crystaltides.net",
  role: "admin",
};
let mockSavedAccounts: Record<string, unknown>[] = [
  {
    id: "acc-1",
    username: "PlayerOne",
    type: "microsoft",
    lastUsed: "2026-09-04",
  },
  {
    id: "acc-2",
    username: "PlayerTwo",
    type: "guest",
    lastUsed: "2026-09-03",
  },
];

vi.mock("@/components/Launcher/mockLauncherState", () => ({
  useAuth: () => ({
    currentSession: mockCurrentSession,
    crystalSession: mockCrystalSession,
    savedAccounts: mockSavedAccounts,
    selectAccount: mockSelectAccount,
    removeAccount: mockRemoveAccount,
    logout: mockLogout,
  }),
  getSettings: () => ({
    avatarPreference: "web",
  }),
  saveSettings: (...args: unknown[]) => mockSaveSettings(...args),
}));

describe("Launcher/AccountSwitcherModal", () => {
  const mockOnClose = vi.fn();
  const mockOnNavigateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSession = {
      id: "acc-1",
      username: "PlayerOne",
      type: "microsoft",
    };
    mockCrystalSession = {
      username: "CrystalMaster",
      email: "master@crystaltides.net",
      role: "admin",
    };
    mockSavedAccounts = [
      {
        id: "acc-1",
        username: "PlayerOne",
        type: "microsoft",
        lastUsed: "2026-09-04",
      },
      {
        id: "acc-2",
        username: "PlayerTwo",
        type: "guest",
        lastUsed: "2026-09-03",
      },
    ];
  });

  it("renders modal header, crystal web session, and minecraft profiles", () => {
    renderWithProviders(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
      />
    );

    expect(screen.getByText(/Selector de Sesiones/i)).toBeInTheDocument();
    expect(screen.getByText("CrystalMaster")).toBeInTheDocument();
    expect(screen.getByText("master@crystaltides.net")).toBeInTheDocument();
    expect(screen.getByText("PlayerOne")).toBeInTheDocument();
    expect(screen.getByText("PlayerTwo")).toBeInTheDocument();
  });

  it("calls onClose when close icon button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
      />
    );

    const closeBtn = screen.getByRole("button", {
      name: "Cerrar selector de sesiones",
    });
    await user.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("allows toggling avatar source preference", () => {
    renderWithProviders(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
      />
    );

    const mcAvatarBtn = screen.getByTitle("Usar Cabeza de Minecraft");
    fireEvent.click(mcAvatarBtn);
    expect(mockSaveSettings).toHaveBeenCalledWith({ avatarPreference: "minecraft" });
  });

  it("selects an account when clicking an inactive profile button", () => {
    renderWithProviders(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
      />
    );

    const playerTwoBtn = screen.getByText("PlayerTwo").closest("button");
    expect(playerTwoBtn).toBeInTheDocument();
    if (playerTwoBtn) {
      fireEvent.click(playerTwoBtn);
      expect(mockSelectAccount).toHaveBeenCalledWith("acc-2");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls removeAccount when clicking remove button on an inactive account", () => {
    renderWithProviders(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
      />
    );

    const removeBtn = screen.getByRole("button", {
      name: "Quitar cuenta de PlayerTwo",
    });
    fireEvent.click(removeBtn);
    expect(mockRemoveAccount).toHaveBeenCalledWith("acc-2");
  });

  it("calls logout and onClose when clicking Cambiar Perfil MC", () => {
    renderWithProviders(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
      />
    );

    const switchBtn = screen.getByRole("button", {
      name: "Cambiar perfil de Minecraft",
    });
    fireEvent.click(switchBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onNavigateSettings and onClose when clicking Ajustes", () => {
    renderWithProviders(
      <AccountSwitcherModal
        onClose={mockOnClose}
        onNavigateSettings={mockOnNavigateSettings}
      />
    );

    const settingsBtn = screen.getByRole("button", {
      name: "Abrir ajustes del launcher",
    });
    fireEvent.click(settingsBtn);
    expect(mockOnNavigateSettings).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
