import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPage } from "@/components/Launcher/SettingsPage";
import { renderWithProviders } from "@/utils/test-utils";

// Mock mockLauncherState
const mockGetSettings = vi.fn();
const mockSaveSettings = vi.fn();
const mockLoginCrystal = vi.fn();
const mockLogoutCrystal = vi.fn();
let mockCrystalSession: Record<string, unknown> | null = null;

vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    getSettings: () => mockGetSettings(),
    saveSettings: (s: unknown) => mockSaveSettings(s),
    useAuth: () => ({
      crystalSession: mockCrystalSession,
      loginCrystal: (...args: unknown[]) => mockLoginCrystal(...args),
      logoutCrystal: (...args: unknown[]) => mockLogoutCrystal(...args),
    }),
  };
});

const DEFAULT_SETTINGS = {
  mcVersion: "1.21.1",
  loaderType: "fabric",
  loaderVersion: "0.16.1",
  minRam: 2048,
  maxRam: 4096,
  useOptimization: true,
  javaPath: "C:\\Java\\bin\\java.exe",
  width: 1280,
  height: 720,
  fullscreen: false,
  gameDir: ".minecraft",
  autoConnect: true,
  serverHost: "mc.crystaltidesSMP.net",
  serverPort: 25565,
  avatarPreference: "web" as const,
};

describe("Launcher/SettingsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCrystalSession = null;
    mockGetSettings.mockReturnValue({ ...DEFAULT_SETTINGS });
    mockSaveSettings.mockImplementation((s: unknown) => ({
      ...DEFAULT_SETTINGS,
      ...(s as object),
    }));
  });

  it("renders page header and main settings categories", () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText("Ajustes del Launcher")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(screen.getByText("Cuenta de CrystalTides")).toBeInTheDocument();
    expect(screen.getByText(/Memoria RAM/i)).toBeInTheDocument();
    expect(screen.getByText(/Ruta de Java/i)).toBeInTheDocument();
    expect(screen.getByText(/Resolución/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Servidor/i })).toBeInTheDocument();
    expect(screen.getByText(/Versión del Juego/i)).toBeInTheDocument();
  });

  it("handles Crystal web account linking and validation", () => {
    renderWithProviders(<SettingsPage />);

    const connectBtn = screen.getByRole("button", {
      name: "Conectar cuenta web",
    });
    // Click without credentials should show error
    fireEvent.click(connectBtn);
    expect(
      screen.getByText(/Por favor ingresa tu correo electrónico/),
    ).toBeInTheDocument();

    // Fill in credentials
    const emailInput = screen.getByPlaceholderText("tu_correo@ejemplo.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "test@crystaltides.net" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.click(connectBtn);

    expect(mockLoginCrystal).toHaveBeenCalledWith(
      "test@crystaltides.net",
      "secret123",
    );
  });

  it("displays linked web account info and handles logout", async () => {
    const user = userEvent.setup();
    mockCrystalSession = {
      username: "CaptainNacho",
      email: "nacho@crystaltides.net",
      avatarUrl: "https://example.com/avatar.png",
      role: "owner",
    };

    renderWithProviders(<SettingsPage />);

    expect(screen.getByText("CaptainNacho")).toBeInTheDocument();
    expect(screen.getByText("nacho@crystaltides.net")).toBeInTheDocument();

    const unlinkBtn = screen.getByRole("button", {
      name: "Desvincular cuenta web de CrystalTides",
    });
    await user.click(unlinkBtn);
    expect(mockLogoutCrystal).toHaveBeenCalledTimes(1);
  });

  it("switches avatar preference between web and minecraft", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const mcAvatarBtn = screen.getByRole("button", {
      name: "Usar cabeza de Minecraft",
    });
    await user.click(mcAvatarBtn);

    expect(mockSaveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ avatarPreference: "minecraft" }),
    );

    const webAvatarBtn = screen.getByRole("button", {
      name: "Usar foto de perfil web",
    });
    await user.click(webAvatarBtn);

    expect(mockSaveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ avatarPreference: "web" }),
    );
  });

  it("toggles fullscreen and disables width/height inputs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const widthInput = screen.getByLabelText("Ancho");
    const heightInput = screen.getByLabelText("Alto");
    expect(widthInput).not.toBeDisabled();
    expect(heightInput).not.toBeDisabled();

    const fullscreenCheckbox = screen.getByLabelText("Pantalla completa");
    await user.click(fullscreenCheckbox);

    expect(widthInput).toBeDisabled();
    expect(heightInput).toBeDisabled();
  });

  it("toggles server autoconnect", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    expect(screen.getByLabelText("Host")).toBeInTheDocument();
    expect(screen.getByLabelText("Puerto")).toBeInTheDocument();

    const autoConnectCheckbox = screen.getByLabelText(
      /Conectar automáticamente al servidor/,
    );
    await user.click(autoConnectCheckbox);

    expect(screen.queryByLabelText("Host")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Puerto")).not.toBeInTheDocument();
  });

  it("saves modified settings when Guardar Configuración is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const saveBtn = screen.getByRole("button", {
      name: /Guardar Configuración/i,
    });
    await user.click(saveBtn);

    expect(mockSaveSettings).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/✅ Guardado/i)).toBeInTheDocument();
  });

  it("restores default settings when Restaurar Valores is clicked", async () => {
    const user = userEvent.setup();
    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
    renderWithProviders(<SettingsPage />);

    const restoreBtn = screen.getByRole("button", {
      name: /Restaurar Valores/i,
    });
    await user.click(restoreBtn);

    expect(removeItemSpy).toHaveBeenCalledWith("crystaltides_settings");
    expect(mockGetSettings).toHaveBeenCalled();
  });
});
