import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrashModal } from "@/components/Launcher/CrashModal";
import { renderWithProviders } from "@/utils/test-utils";

describe("Launcher/CrashModal", () => {
  const mockOnClose = vi.fn();
  const mockOnRelaunch = vi.fn();
  const mockWriteText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = renderWithProviders(
      <CrashModal
        isOpen={false}
        onClose={mockOnClose}
        onRelaunch={mockOnRelaunch}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders modal dialog content when isOpen is true", () => {
    renderWithProviders(
      <CrashModal
        isOpen={true}
        onClose={mockOnClose}
        onRelaunch={mockOnRelaunch}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Cierre Inesperado Detectado")).toBeInTheDocument();
    expect(
      screen.getByText(
        /El servidor interno o un mod ha generado un error fatal/i,
      ),
    ).toBeInTheDocument();
  });

  it("calls onClose when close icon button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CrashModal
        isOpen={true}
        onClose={mockOnClose}
        onRelaunch={mockOnRelaunch}
      />,
    );

    const closeIconBtn = screen.getByRole("button", {
      name: "Cerrar reporte de fallo",
    });
    await user.click(closeIconBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onRelaunch when Reiniciar Juego button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CrashModal
        isOpen={true}
        onClose={mockOnClose}
        onRelaunch={mockOnRelaunch}
      />,
    );

    const relaunchBtn = screen.getByRole("button", {
      name: /Reiniciar Juego/i,
    });
    expect(relaunchBtn).toBeInTheDocument();
    await user.click(relaunchBtn);
    expect(mockOnRelaunch).toHaveBeenCalledTimes(1);
  });

  it("copies error log to clipboard when Copiar Crash Log button is clicked", () => {
    renderWithProviders(
      <CrashModal
        isOpen={true}
        onClose={mockOnClose}
        onRelaunch={mockOnRelaunch}
      />,
    );

    const copyBtn = screen.getByRole("button", {
      name: "Copiar registro de fallo al portapapeles",
    });
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);
    expect(screen.getByText("Copiado")).toBeInTheDocument();
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining("Loading Minecraft 1.21.3 with Fabric Loader"),
    );
  });
});
