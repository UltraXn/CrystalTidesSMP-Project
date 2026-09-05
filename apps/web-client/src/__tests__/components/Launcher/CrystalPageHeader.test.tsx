import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { CrystalPageHeader } from "@/components/Launcher/CrystalPageHeader";

describe("CrystalPageHeader Component", () => {
  it("renders eyebrow and title correctly", () => {
    renderWithProviders(
      <CrystalPageHeader eyebrow="Servidores" title="Seleccionar Servidor" />
    );

    expect(screen.getByText("Servidores")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Seleccionar Servidor" })).toBeInTheDocument();
  });

  it("renders optional trailing element when provided", () => {
    renderWithProviders(
      <CrystalPageHeader
        eyebrow="Ajustes"
        title="Configuración"
        trailing={<button type="button">Guardar Cambios</button>}
      />
    );

    expect(screen.getByRole("button", { name: /Guardar Cambios/i })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <CrystalPageHeader eyebrow="Wiki" title="Criaturas" className="custom-wiki-header" />
    );

    const headerEl = container.querySelector(".crystal-page-header");
    expect(headerEl).toHaveClass("custom-wiki-header");
  });
});
