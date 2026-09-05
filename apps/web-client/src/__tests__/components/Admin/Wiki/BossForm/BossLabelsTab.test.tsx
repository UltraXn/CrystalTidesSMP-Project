import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import { BossLabelsTab } from "@/components/Admin/Wiki/BossForm/BossLabelsTab";
import { WikiArticle } from "@/services/wikiService";

describe("BossLabelsTab", () => {
  const mockFormData: Partial<WikiArticle> = {
    card_theme: "red",
    threat_label: "NIVEL DE AMENAZA",
    hp_label: "SALUD DE COMBATE",
    damage_label: "PODER DE DAÑO",
    speed_label: "VELOCIDAD",
    location_label: "UBICACIÓN",
    drops_label: "BOTÍN DE CAZA",
    bounty_label: "RECOMPENSA DE CAZA",
  };

  it("renders all label and theme inputs with initial values", () => {
    const setFormData = vi.fn();
    renderWithProviders(
      <BossLabelsTab formData={mockFormData} setFormData={setFormData} />,
    );

    expect(
      screen.getByLabelText("Tema de Color Visual (Card Theme)"),
    ).toHaveValue("red");
    expect(
      screen.getByLabelText("Título Cuadro 1 (Amenaza / Tipo)"),
    ).toHaveValue("NIVEL DE AMENAZA");
    expect(screen.getByLabelText("Título Cuadro 2 (Salud / Vida)")).toHaveValue(
      "SALUD DE COMBATE",
    );
    expect(
      screen.getByLabelText("Título Cuadro 3 (Ataque / Daño)"),
    ).toHaveValue("PODER DE DAÑO");
    expect(
      screen.getByLabelText("Título Cuadro 4 (Velocidad / Marcha)"),
    ).toHaveValue("VELOCIDAD");
    expect(screen.getByLabelText("Título Hábitat / Ubicación")).toHaveValue(
      "UBICACIÓN",
    );
    expect(screen.getByLabelText("Título Drops / Objetos")).toHaveValue(
      "BOTÍN DE CAZA",
    );
    expect(
      screen.getByLabelText("Título Pie de Página (Recompensa)"),
    ).toHaveValue("RECOMPENSA DE CAZA");
  });

  it("updates card theme when selecting an option", async () => {
    const user = userEvent.setup();
    const setFormData = vi.fn();
    renderWithProviders(
      <BossLabelsTab formData={mockFormData} setFormData={setFormData} />,
    );

    const themeSelect = screen.getByLabelText(
      "Tema de Color Visual (Card Theme)",
    );
    await user.selectOptions(themeSelect, "purple");

    expect(setFormData).toHaveBeenCalledWith({
      ...mockFormData,
      card_theme: "purple",
    });
  });

  it("updates text label inputs on change", () => {
    const setFormData = vi.fn();
    renderWithProviders(
      <BossLabelsTab formData={mockFormData} setFormData={setFormData} />,
    );

    const threatInput = screen.getByLabelText(
      "Título Cuadro 1 (Amenaza / Tipo)",
    );
    fireEvent.change(threatInput, { target: { value: "PELIGRO" } });

    expect(setFormData).toHaveBeenCalledWith({
      ...mockFormData,
      threat_label: "PELIGRO",
    });
  });
});
