import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import { ProfileEditorDialog } from "@/components/Launcher/ProfileEditorDialog";
import * as mockState from "@/components/Launcher/mockLauncherState";

describe("ProfileEditorDialog Component", () => {
  const existingProfile: mockState.Profile = {
    id: "profile-1",
    name: "Aventura Vanilla",
    mcVersion: "1.21.1",
    loaderType: "vanilla",
    iconPath: "🌊",
    isolateSaves: false,
    useOptimization: true,
    minRam: 2048,
    maxRam: 4096,
    loaderVersion: "1.21.1",
    created: "2026-09-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mockState, "fetchVanillaVersions").mockResolvedValue([
      "1.21.1",
      "1.20.4",
    ]);
    vi.spyOn(mockState, "fetchNeoForgeVersions").mockResolvedValue([
      "21.1.65",
      "21.0.8",
    ]);
    vi.spyOn(mockState, "fetchFabricLoaderVersions").mockResolvedValue([
      "0.15.11",
    ]);
    vi.spyOn(mockState, "fetchForgeVersions").mockResolvedValue(["47.2.0"]);
    vi.spyOn(mockState, "createProfile").mockImplementation(
      () => ({}) as unknown as mockState.Profile,
    );
    vi.spyOn(mockState, "updateProfile").mockImplementation(
      () => ({}) as unknown as mockState.Profile,
    );
  });

  it("renders create profile dialog when no profile is passed", async () => {
    renderWithProviders(
      <ProfileEditorDialog onClose={vi.fn()} onSave={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Crear Perfil" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Nombre del Perfil/i)).toHaveValue(
        "Nuevo Perfil",
      );
    });
  });

  it("renders edit profile dialog when existing profile is passed", async () => {
    renderWithProviders(
      <ProfileEditorDialog
        profile={existingProfile}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Editar Perfil" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Nombre del Perfil/i)).toHaveValue(
        "Aventura Vanilla",
      );
    });
  });

  it("calls onClose when clicking close button or Cancelar", async () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <ProfileEditorDialog onClose={handleClose} onSave={vi.fn()} />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    const closeBtn = screen.getByLabelText("Cerrar editor de perfil");
    await userEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await userEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it("allows selecting an emoji icon", async () => {
    renderWithProviders(
      <ProfileEditorDialog onClose={vi.fn()} onSave={vi.fn()} />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    const swordIconBtn = screen.getByRole("button", {
      name: "Seleccionar icono ⚔️",
    });
    await userEvent.click(swordIconBtn);

    expect(swordIconBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("saves a new profile and triggers onSave and onClose", async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    renderWithProviders(
      <ProfileEditorDialog onClose={handleClose} onSave={handleSave} />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    const nameInput = screen.getByLabelText(/Nombre del Perfil/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Mi Nuevo Perfil");

    const saveBtn = screen.getByRole("button", { name: "Guardar" });
    await userEvent.click(saveBtn);

    expect(mockState.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Mi Nuevo Perfil",
      }),
    );
    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("updates an existing profile on submit", async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    renderWithProviders(
      <ProfileEditorDialog
        profile={existingProfile}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    const nameInput = screen.getByLabelText(/Nombre del Perfil/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Vanilla Modificado");

    const saveBtn = screen.getByRole("button", { name: "Guardar" });
    await userEvent.click(saveBtn);

    expect(mockState.updateProfile).toHaveBeenCalledWith(
      "profile-1",
      expect.objectContaining({
        name: "Vanilla Modificado",
      }),
    );
    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
