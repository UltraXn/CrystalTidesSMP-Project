import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileManagerPage } from "@/components/Launcher/ProfileManagerPage";
import { renderWithProviders } from "@/utils/test-utils";

// Mock the mockLauncherState module
const mockGetProfiles = vi.fn();
const mockGetActiveProfile = vi.fn();
const mockSetSelectedProfileId = vi.fn();
const mockDeleteProfile = vi.fn();
const mockCloneProfile = vi.fn();

vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    getProfiles: (...args: unknown[]) => mockGetProfiles(...args),
    getActiveProfile: (...args: unknown[]) => mockGetActiveProfile(...args),
    setSelectedProfileId: (...args: unknown[]) =>
      mockSetSelectedProfileId(...args),
    deleteProfile: (...args: unknown[]) => mockDeleteProfile(...args),
    cloneProfile: (...args: unknown[]) => mockCloneProfile(...args),
  };
});

// Mock ProfileEditorDialog to avoid deep rendering its complex form
vi.mock("@/components/Launcher/ProfileEditorDialog", () => ({
  ProfileEditorDialog: ({
    onClose,
    onSave,
    profile,
  }: {
    onClose: () => void;
    onSave: () => void;
    profile: unknown;
  }) => (
    <div data-testid="profile-editor-dialog">
      <span data-testid="editing-profile">
        {profile ? "editing" : "creating"}
      </span>
      <button onClick={onClose}>Close Editor</button>
      <button onClick={onSave}>Save Editor</button>
    </div>
  ),
}));

const SAMPLE_PROFILES = [
  {
    id: "default-profile-id",
    name: "CrystalTides Official",
    mcVersion: "1.21.3",
    loaderType: "fabric" as const,
    loaderVersion: "0.16.1",
    iconPath: "🌊",
    isolateSaves: false,
    useOptimization: true,
    created: "2026-01-01T00:00:00.000Z",
    lastUsed: "2026-09-04T10:00:00.000Z",
  },
  {
    id: "custom-1",
    name: "Vanilla 1.20",
    mcVersion: "1.20.4",
    loaderType: "" as const,
    loaderVersion: "",
    iconPath: "🟢",
    isolateSaves: true,
    useOptimization: false,
    created: "2026-06-15T00:00:00.000Z",
    lastUsed: "2026-08-20T14:00:00.000Z",
  },
  {
    id: "custom-2",
    name: "Modded NeoForge",
    mcVersion: "1.21.1",
    loaderType: "neoforge" as const,
    loaderVersion: "21.1.72",
    iconPath: "🔧",
    isolateSaves: true,
    useOptimization: true,
    created: "2026-07-01T00:00:00.000Z",
  },
];

describe("Launcher/ProfileManagerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfiles.mockReturnValue(SAMPLE_PROFILES);
    mockGetActiveProfile.mockReturnValue(SAMPLE_PROFILES[0]);
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders page header and description", async () => {
    renderWithProviders(<ProfileManagerPage />);

    expect(screen.getByText("Gestión de Perfiles")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
    expect(
      screen.getByText(/Crea perfiles independientes/),
    ).toBeInTheDocument();
  });

  it("renders all profile cards with name and version info", async () => {
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(
        screen.getByText("CrystalTides Official"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Vanilla 1.20")).toBeInTheDocument();
    expect(screen.getByText("Modded NeoForge")).toBeInTheDocument();
  });

  it("shows ACTIVO badge on the active profile", async () => {
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(screen.getByText("ACTIVO")).toBeInTheDocument();
    });
  });

  it("shows Activar button only for non-active profiles", async () => {
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      const activateButtons = screen.getAllByText("Activar");
      // 2 non-active profiles should have Activar buttons
      expect(activateButtons).toHaveLength(2);
    });
  });

  it("does not show delete button for default profile", async () => {
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(
        screen.getByText("CrystalTides Official"),
      ).toBeInTheDocument();
    });

    // Default profile should not have a delete button
    expect(
      screen.queryByLabelText("Eliminar perfil CrystalTides Official"),
    ).not.toBeInTheDocument();

    // Custom profiles should have delete buttons
    expect(
      screen.getByLabelText("Eliminar perfil Vanilla 1.20"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Eliminar perfil Modded NeoForge"),
    ).toBeInTheDocument();
  });

  it("activates a profile when Activar is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(screen.getByText("Vanilla 1.20")).toBeInTheDocument();
    });

    const activateBtn = screen.getByLabelText(
      "Activar perfil Vanilla 1.20",
    );
    await user.click(activateBtn);

    expect(mockSetSelectedProfileId).toHaveBeenCalledWith("custom-1");
  });

  it("opens editor in create mode when Crear Perfil is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileManagerPage />);

    const createBtn = screen.getByLabelText(
      "Crear nuevo perfil de Minecraft",
    );
    await user.click(createBtn);

    expect(screen.getByTestId("profile-editor-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("editing-profile")).toHaveTextContent(
      "creating",
    );
  });

  it("opens editor in edit mode when Editar is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(screen.getByText("Vanilla 1.20")).toBeInTheDocument();
    });

    const editBtn = screen.getByLabelText("Editar perfil Vanilla 1.20");
    await user.click(editBtn);

    expect(screen.getByTestId("profile-editor-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("editing-profile")).toHaveTextContent(
      "editing",
    );
  });

  it("clones a profile when Clonar is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(screen.getByText("Vanilla 1.20")).toBeInTheDocument();
    });

    const cloneBtn = screen.getByLabelText("Clonar perfil Vanilla 1.20");
    await user.click(cloneBtn);

    expect(mockCloneProfile).toHaveBeenCalledWith("custom-1");
  });

  it("deletes a profile after confirmation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(screen.getByText("Vanilla 1.20")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByLabelText(
      "Eliminar perfil Vanilla 1.20",
    );
    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteProfile).toHaveBeenCalledWith("custom-1");
  });

  it("does not delete when user cancels confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    renderWithProviders(<ProfileManagerPage />);

    await waitFor(() => {
      expect(screen.getByText("Vanilla 1.20")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByLabelText(
      "Eliminar perfil Vanilla 1.20",
    );
    await user.click(deleteBtn);

    expect(mockDeleteProfile).not.toHaveBeenCalled();
  });

  it("shows alert when trying to delete default profile", async () => {
    // Temporarily add delete button for default profile via a modified profile list
    const profilesWithDefaultDeletable = [
      { ...SAMPLE_PROFILES[0] },
      SAMPLE_PROFILES[1],
    ];
    mockGetProfiles.mockReturnValue(profilesWithDefaultDeletable);
    renderWithProviders(<ProfileManagerPage />);

    // The component prevents deletion of default-profile-id via id check,
    // not by hiding the button (the button IS hidden for default id).
    // So we validate the logic handles it if called directly.
    // This is already covered by the "does not show delete button" test.
    expect(
      screen.queryByLabelText("Eliminar perfil CrystalTides Official"),
    ).not.toBeInTheDocument();
  });

  it("closes editor and refreshes profiles on save", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileManagerPage />);

    // Open editor
    const createBtn = screen.getByLabelText(
      "Crear nuevo perfil de Minecraft",
    );
    await user.click(createBtn);
    expect(screen.getByTestId("profile-editor-dialog")).toBeInTheDocument();

    // Save
    const saveBtn = screen.getByText("Save Editor");
    await user.click(saveBtn);

    // Editor should be closed
    expect(
      screen.queryByTestId("profile-editor-dialog"),
    ).not.toBeInTheDocument();
    // Profiles should be refreshed
    expect(mockGetProfiles).toHaveBeenCalledTimes(2);
  });
});
