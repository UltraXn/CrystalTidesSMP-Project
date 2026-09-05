import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import { ProfileSelector } from "@/components/Launcher/ProfileSelector";
import * as mockState from "@/components/Launcher/mockLauncherState";

describe("ProfileSelector Component", () => {
  const mockProfiles: mockState.Profile[] = [
    {
      id: "default-profile-id",
      name: "CrystalTides Oficial",
      mcVersion: "1.21.3",
      loaderType: "fabric",
      loaderVersion: "0.16.0",
      iconPath: "🌊",
      maxRam: 4096,
      minRam: 2048,
      isolateSaves: false,
      useOptimization: true,
      created: "2026-09-01",
    },
    {
      id: "profile-pvp-id",
      name: "Legacy PvP 1.8.9",
      mcVersion: "1.8.9",
      loaderType: "forge",
      loaderVersion: "11.15.1",
      iconPath: "⚔️",
      maxRam: 2048,
      minRam: 1024,
      isolateSaves: false,
      useOptimization: true,
      created: "2026-09-01",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mockState, "getProfiles").mockReturnValue(mockProfiles);
    vi.spyOn(mockState, "getActiveProfile").mockReturnValue(mockProfiles[0]);
    vi.spyOn(mockState, "setSelectedProfileId").mockImplementation(() => {});
    vi.spyOn(mockState, "getSettings").mockReturnValue({
      mcVersion: "1.21.3",
      loaderType: "fabric",
      loaderVersion: "0.16.0",
      maxRam: 4096,
      minRam: 2048,
      useOptimization: true,
      javaPath: "",
      width: 1280,
      height: 720,
      fullscreen: false,
      gameDir: "",
      autoConnect: true,
      serverHost: "play.crystaltides.net",
      serverPort: 25565,
    });
  });

  it("renders active profile name and version", () => {
    renderWithProviders(
      <ProfileSelector
        onEditProfile={vi.fn()}
        onCreateProfile={vi.fn()}
      />
    );

    expect(screen.getByText("CrystalTides Oficial")).toBeInTheDocument();
    expect(screen.getByText(/1\.21\.3 · Fabric/i)).toBeInTheDocument();
  });

  it("opens dropdown when clicking on active profile chip", async () => {
    renderWithProviders(
      <ProfileSelector
        onEditProfile={vi.fn()}
        onCreateProfile={vi.fn()}
      />
    );

    expect(screen.queryByText("Selecciona un Perfil")).not.toBeInTheDocument();

    const chip = screen.getByRole("button");
    await userEvent.click(chip);

    expect(screen.getByText("Selecciona un Perfil")).toBeInTheDocument();
    expect(screen.getByText("Legacy PvP 1.8.9")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear nuevo perfil/i })).toBeInTheDocument();
  });

  it("selects another profile and triggers onProfileChanged", async () => {
    const onProfileChanged = vi.fn();
    renderWithProviders(
      <ProfileSelector
        onEditProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onProfileChanged={onProfileChanged}
      />
    );

    const chip = screen.getByRole("button");
    await userEvent.click(chip);

    const secondProfileBtn = screen.getByRole("button", {
      name: `Seleccionar perfil ${mockProfiles[1].name}`,
    });
    await userEvent.click(secondProfileBtn);

    expect(mockState.setSelectedProfileId).toHaveBeenCalledWith("profile-pvp-id");
    expect(onProfileChanged).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Selecciona un Perfil")).not.toBeInTheDocument();
  });

  it("triggers onCreateProfile when clicking 'Nuevo Perfil' button", async () => {
    const handleCreate = vi.fn();
    renderWithProviders(
      <ProfileSelector
        onEditProfile={vi.fn()}
        onCreateProfile={handleCreate}
      />
    );

    const chip = screen.getByRole("button");
    await userEvent.click(chip);

    const createBtn = screen.getByRole("button", { name: /Crear nuevo perfil/i });
    await userEvent.click(createBtn);

    expect(handleCreate).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Selecciona un Perfil")).not.toBeInTheDocument();
  });

  it("triggers onEditProfile when clicking the edit button of a profile", async () => {
    const handleEdit = vi.fn();
    renderWithProviders(
      <ProfileSelector
        onEditProfile={handleEdit}
        onCreateProfile={vi.fn()}
      />
    );

    const chip = screen.getByRole("button");
    await userEvent.click(chip);

    const editBtn = screen.getByRole("button", {
      name: `Editar perfil ${mockProfiles[0].name}`,
    });
    await userEvent.click(editBtn);

    expect(handleEdit).toHaveBeenCalledWith(mockProfiles[0]);
    expect(screen.queryByText("Selecciona un Perfil")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", async () => {
    renderWithProviders(
      <div>
        <div data-testid="outside-element">Outside</div>
        <ProfileSelector
          onEditProfile={vi.fn()}
          onCreateProfile={vi.fn()}
        />
      </div>
    );

    const chip = screen.getByRole("button");
    await userEvent.click(chip);
    expect(screen.getByText("Selecciona un Perfil")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(screen.queryByText("Selecciona un Perfil")).not.toBeInTheDocument();
  });
});
