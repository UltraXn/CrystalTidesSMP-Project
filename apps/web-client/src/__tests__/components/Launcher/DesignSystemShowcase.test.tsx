import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import { DesignSystemShowcase } from "@/components/Launcher/DesignSystemShowcase";

describe("DesignSystemShowcase Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders main heading, badge, and tabs", () => {
    renderWithProviders(<DesignSystemShowcase />);

    expect(screen.getByText(/SISTEMA DE DISEÑO & WIREFRAMES/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Anatomía Visual del/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Paleta Cromática/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tipografía & Jerarquía/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Componentes Atómicos UI/i })).toBeInTheDocument();
  });

  it("renders color palette items by default", () => {
    renderWithProviders(<DesignSystemShowcase />);

    expect(screen.getByText("Beyond Black")).toBeInTheDocument();
    expect(screen.getByText("Obsidian Deep")).toBeInTheDocument();
    expect(screen.getByText("Electric Teal")).toBeInTheDocument();
    expect(screen.getByText("Void Violet")).toBeInTheDocument();
  });

  it("copies hex code to clipboard when clicking a color card", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    renderWithProviders(<DesignSystemShowcase />);

    const tealCard = screen.getByText("Electric Teal").closest("div");
    if (tealCard) {
      fireEvent.click(tealCard);
      expect(writeTextMock).toHaveBeenCalledWith("#2DD4BF");
    }
  });

  it("switches to typography tab", async () => {
    renderWithProviders(<DesignSystemShowcase />);

    const typoTab = screen.getByRole("button", { name: /Tipografía & Jerarquía/i });
    await userEvent.click(typoTab);

    expect(screen.getByText(/CRYSTALTIDES CLIENT 1\.21/i)).toBeInTheDocument();
    expect(screen.getByText(/DISPLAY HEADINGS • WEIGHT 900 BLACK/i)).toBeInTheDocument();
  });

  it("switches to components tab and displays interactive widgets", async () => {
    renderWithProviders(<DesignSystemShowcase />);

    const compTab = screen.getByRole("button", { name: /Componentes Atómicos UI/i });
    await userEvent.click(compTab);

    expect(screen.getByText(/Botones & Acciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Switches de Mods & Opciones/i)).toBeInTheDocument();
    expect(screen.getByText(/INICIAR JUEGO \(1\.21\.3 FABRIC\)/i)).toBeInTheDocument();
  });
});
