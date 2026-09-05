import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import { BossMetadataFields } from "@/components/Admin/Wiki/BossForm/BossMetadataFields";
import { WikiArticle } from "@/services/wikiService";

vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: class MockGLTFLoader {
    load = vi.fn();
  },
}));

vi.mock("@/components/Wiki/WikiBoss3DCard", () => ({
  default: () => <div data-testid="mock-3d-card" />,
}));

describe("BossMetadataFields", () => {
  const mockFormData: Partial<WikiArticle> = {
    title: "Leviathan",
    boss_subtitle: "Terror of the Deep",
    boss_hp: "1000 HP",
    boss_damage: "40 Daño",
    model_3d_url: "/models/leviathan.gltf",
  };

  let writeTextSpy = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextSpy,
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders header, copy/import buttons, and tab navigation", () => {
    const setFormData = vi.fn();
    renderWithProviders(
      <BossMetadataFields formData={mockFormData} setFormData={setFormData} />,
    );

    expect(
      screen.getByText(/🐉 Configuración de Entidades, Mods & Bosses 3D/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Importar desde IA \/ JSON/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Copiar JSON Boss/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /1\. Origen & Render 3D/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /2\. Stats/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /3\. Editor N-Fases & Clips/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /4\. Ritual, Audio & Drops/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /5\. Etiquetas Dinámicas & Tema/i }),
    ).toBeInTheDocument();
  });

  it("switches tabs to render different tab views", async () => {
    const user = userEvent.setup();
    const setFormData = vi.fn();
    renderWithProviders(
      <BossMetadataFields formData={mockFormData} setFormData={setFormData} />,
    );

    // Initially on models tab
    expect(
      screen.getByLabelText("Sistema / Origen de Entidad"),
    ).toBeInTheDocument();

    // Switch to stats tab
    const statsTabBtn = screen.getByRole("button", { name: /2\. Stats/i });
    await user.click(statsTabBtn);
    expect(screen.getByLabelText("Salud Fase 1 (HP)")).toBeInTheDocument();

    // Switch to labels tab
    const labelsTabBtn = screen.getByRole("button", {
      name: /5\. Etiquetas Dinámicas & Tema/i,
    });
    await user.click(labelsTabBtn);
    expect(
      screen.getByLabelText("Tema de Color Visual (Card Theme)"),
    ).toBeInTheDocument();
  });

  it('copies current JSON to clipboard when clicking copy button', () => {
    renderWithProviders(
        <BossMetadataFields formData={mockFormData} setFormData={vi.fn()} />
    );

    const copyBtn = screen.getByRole('button', { name: /Copiar JSON Boss/i });
    fireEvent.click(copyBtn);

    expect(writeTextSpy).toHaveBeenCalledWith(
        expect.stringContaining('"title": "Leviathan"')
    );
  });

  it("opens and closes AI JSON Import modal", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BossMetadataFields formData={mockFormData} setFormData={vi.fn()} />,
    );

    const importBtn = screen.getByRole("button", {
      name: /Importar desde IA \/ JSON/i,
    });
    await user.click(importBtn);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Asistente IA - Importador & Generador JSON 3D/i,
      }),
    ).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await user.click(cancelBtn);

    expect(
      screen.queryByRole("heading", { level: 3, name: /Asistente IA/i }),
    ).not.toBeInTheDocument();
  });
});
