import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModManagerPage } from "@/components/Launcher/ModManagerPage";
import { renderWithProviders } from "@/utils/test-utils";

// Mock @tauri-apps/plugin-opener
const mockOpenPath = vi.fn().mockResolvedValue(undefined);
vi.mock("@tauri-apps/plugin-opener", () => ({
  openPath: (...args: unknown[]) => mockOpenPath(...args),
}));

// Mock mockLauncherState
const mockListInstalledMods = vi.fn();
const mockGetModsRegistry = vi.fn();
const mockSetModEnabled = vi.fn();
const mockDeleteInstalledMod = vi.fn();
const mockUnregisterMod = vi.fn();
const mockRegisterInstalledMod = vi.fn();
const mockFetchOfficialModsList = vi.fn();
const mockSyncOfficialMods = vi.fn();
const mockSearchModrinth = vi.fn();
const mockSearchCurseForge = vi.fn();
const mockInstallModFromModrinth = vi.fn();
const mockInstallModFromCurseForge = vi.fn();
const mockGetActiveProfile = vi.fn();
const mockResolveProfileGameDir = vi.fn();
const mockFetchVanillaVersions = vi.fn();

vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    listInstalledMods: (...args: unknown[]) => mockListInstalledMods(...args),
    getModsRegistry: (...args: unknown[]) => mockGetModsRegistry(...args),
    setModEnabled: (...args: unknown[]) => mockSetModEnabled(...args),
    deleteInstalledMod: (...args: unknown[]) => mockDeleteInstalledMod(...args),
    unregisterMod: (...args: unknown[]) => mockUnregisterMod(...args),
    registerInstalledMod: (...args: unknown[]) => mockRegisterInstalledMod(...args),
    fetchOfficialModsList: () => mockFetchOfficialModsList(),
    syncOfficialMods: (...args: unknown[]) => mockSyncOfficialMods(...args),
    searchModrinth: (...args: unknown[]) => mockSearchModrinth(...args),
    searchCurseForge: (...args: unknown[]) => mockSearchCurseForge(...args),
    installModFromModrinth: (...args: unknown[]) => mockInstallModFromModrinth(...args),
    installModFromCurseForge: (...args: unknown[]) => mockInstallModFromCurseForge(...args),
    getActiveProfile: () => mockGetActiveProfile(),
    resolveProfileGameDir: (...args: unknown[]) => mockResolveProfileGameDir(...args),
    fetchVanillaVersions: () => mockFetchVanillaVersions(),
  };
});

const SAMPLE_INSTALLED_MODS = [
  {
    filename: "sodium-fabric-0.5.8.jar",
    sizeBytes: 1048576,
    enabled: true,
    official: true,
  },
  {
    filename: "iris-1.6.14.jar",
    sizeBytes: 2097152,
    enabled: true,
    official: false,
  },
  {
    filename: "voicechat-fabric-1.20.4-2.4.32.jar.disabled",
    sizeBytes: 524288,
    enabled: false,
    official: false,
  },
];

const SAMPLE_REGISTRY = {
  "sodium-fabric-0.5.8.jar": {
    title: "Sodium",
    source: "modrinth",
  },
  "iris-1.6.14.jar": {
    title: "Iris Shaders",
    source: "modrinth",
  },
  "voicechat-fabric-1.20.4-2.4.32.jar.disabled": {
    title: "Simple Voice Chat",
    source: "modrinth",
  },
};

const SAMPLE_SERVER_MODS = [
  {
    name: "crystaltides-core-1.0.jar",
    sha1: "abc12345",
    size: 1048576,
    category: "Optimización",
    description: "Core mod for CrystalTides server connection",
  },
  {
    name: "voicechat-fabric.jar",
    sha1: "def67890",
    size: 2097152,
    category: "Audio",
    description: "Proximity voice chat mod",
  },
];

const SAMPLE_SEARCH_RESULTS = {
  hits: [
    {
      id: "sodium",
      title: "Sodium",
      description: "Modern rendering engine for Minecraft.",
      author: "jellysquid",
      downloads: 45000000,
      categories: ["optimization"],
      date_modified: new Date().toISOString(),
    },
    {
      id: "lithium",
      title: "Lithium",
      description: "General-purpose physics and chunk optimization.",
      author: "jellysquid",
      downloads: 30000000,
      categories: ["optimization"],
      date_modified: new Date().toISOString(),
    },
  ],
  total: 2,
};

describe("Launcher/ModManagerPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActiveProfile.mockReturnValue({
      id: "default",
      name: "NeoForge Profile",
      mcVersion: "1.21.1",
      loaderType: "neoforge",
      gameDir: "C:/Games/crystaltides",
    });
    mockResolveProfileGameDir.mockReturnValue("C:/Games/crystaltides");
    mockListInstalledMods.mockResolvedValue(SAMPLE_INSTALLED_MODS);
    mockGetModsRegistry.mockResolvedValue(SAMPLE_REGISTRY);
    mockFetchOfficialModsList.mockResolvedValue(SAMPLE_SERVER_MODS);
    mockFetchVanillaVersions.mockResolvedValue(["1.21.1", "1.20.4"]);
    mockSearchModrinth.mockResolvedValue(SAMPLE_SEARCH_RESULTS);
    mockSearchCurseForge.mockResolvedValue(SAMPLE_SEARCH_RESULTS);
    mockInstallModFromModrinth.mockResolvedValue("sodium-fabric.jar");
  });

  it("renders installed mods tab with mod list and sidebar stats", async () => {
    renderWithProviders(<ModManagerPage />);

    expect(screen.getByRole("tab", { name: /Mods Instalados/i })).toBeInTheDocument();
    expect(await screen.findByText("Sodium")).toBeInTheDocument();
    expect(screen.getByText("Iris Shaders")).toBeInTheDocument();
    expect(screen.getByText("Simple Voice Chat")).toBeInTheDocument();

    // Check stats
    expect(screen.getByText("NeoForge Profile")).toBeInTheDocument();
    expect(screen.getByText("1.21.1")).toBeInTheDocument();
  });

  it("filters installed mods by search term", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ModManagerPage />);

    expect(await screen.findByText("Sodium")).toBeInTheDocument();

    const searchInput = screen.getByRole("textbox", {
      name: "Filtrar mods instalados por nombre",
    });
    await user.type(searchInput, "Iris");

    expect(screen.getByText("Iris Shaders")).toBeInTheDocument();
    expect(screen.queryByText("Sodium")).not.toBeInTheDocument();
  });

  it("toggles enabled state when clicking checkbox for non-official mod", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ModManagerPage />);

    expect(await screen.findByText("Iris Shaders")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", {
      name: /Activar o desactivar mod Iris Shaders/i,
    });
    expect(checkbox).not.toBeDisabled();

    await user.click(checkbox);

    await waitFor(() => {
      expect(mockSetModEnabled).toHaveBeenCalledWith(
        "C:/Games/crystaltides",
        "iris-1.6.14.jar",
        false,
      );
    });
  });

  it("disables toggle switch for official mods", async () => {
    renderWithProviders(<ModManagerPage />);

    expect(await screen.findByText("Sodium")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", {
      name: /Activar o desactivar mod Sodium/i,
    });
    expect(checkbox).toBeDisabled();
  });

  it("deletes a non-official mod when confirmed", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderWithProviders(<ModManagerPage />);

    expect(await screen.findByText("Iris Shaders")).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle("Eliminar mod");
    expect(deleteButtons.length).toBeGreaterThan(0);

    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDeleteInstalledMod).toHaveBeenCalledWith(
        "C:/Games/crystaltides",
        "iris-1.6.14.jar",
      );
    });
    await waitFor(() => {
      expect(mockUnregisterMod).toHaveBeenCalledWith(
        "C:/Games/crystaltides",
        "iris-1.6.14.jar",
      );
    });
    confirmSpy.mockRestore();
  });

  it("calls openPath when clicking Abrir carpeta de mods", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ModManagerPage />);

    const folderBtn = screen.getByRole("button", {
      name: "Abrir carpeta de mods local",
    });
    await user.click(folderBtn);

    expect(mockOpenPath).toHaveBeenCalledWith("C:/Games/crystaltides/mods");
  });

  it("switches to Sincronizar Oficiales tab and runs sync", async () => {
    const user = userEvent.setup();
    mockSyncOfficialMods.mockImplementation(async (_dir, onProgress) => {
      onProgress("Descargando mods...", 0.5);
    });

    renderWithProviders(<ModManagerPage />);

    const syncTab = screen.getByRole("tab", { name: "Sincronizar mods oficiales" });
    await user.click(syncTab);

    expect(screen.getByText("Sincronización de Mods Oficiales")).toBeInTheDocument();
    expect(await screen.findByText("crystaltides-core-1.0")).toBeInTheDocument();

    const syncBtn = screen.getByRole("button", { name: "Sincronizar mods con el servidor" });
    await user.click(syncBtn);

    expect(mockSyncOfficialMods).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("✅ Sincronización completada.")).toBeInTheDocument();
    });
  });

  it("switches to Buscador de Mods tab, searches, and installs a mod", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ModManagerPage />);

    const searchTab = screen.getByRole("tab", { name: "Buscador de mods en línea" });
    await user.click(searchTab);

    expect(await screen.findByText("Lithium")).toBeInTheDocument();

    const installBtns = screen.getAllByRole("button", { name: /Instalar/i });
    expect(installBtns.length).toBeGreaterThan(0);

    await user.click(installBtns[0]);

    expect(mockInstallModFromModrinth).toHaveBeenCalled();
    expect(mockRegisterInstalledMod).toHaveBeenCalled();
  });
});
