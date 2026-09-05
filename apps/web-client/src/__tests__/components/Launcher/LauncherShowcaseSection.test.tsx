import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LauncherShowcaseSection } from "@/components/Launcher/LauncherShowcaseSection";
import { renderWithProviders } from "@/utils/test-utils";

// Mock MainLayout to keep the focus on LauncherShowcaseSection
vi.mock("@/components/Launcher/MainLayout", () => ({
  MainLayout: () => <div data-testid="mock-main-layout">Mock MainLayout</div>,
}));

vi.mock("framer-motion", () => ({
  m: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe("Launcher/LauncherShowcaseSection Component", () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  it("renders section title, subtitle, and specs", () => {
    renderWithProviders(<LauncherShowcaseSection />);

    expect(
      screen.getByText(/CLIENTE OFICIAL TAURI 2.0 • RUST \+ REACT/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/¡imagina cómo vuela en tu PC!/i),
    ).toBeInTheDocument();
    expect(screen.getByText("RAM Nativa:")).toBeInTheDocument();
    expect(screen.getByText("Arranque:")).toBeInTheDocument();
    expect(screen.getByText("Rendimiento:")).toBeInTheDocument();
  });

  it("renders embedded sandbox simulator with mock MainLayout and controls", () => {
    renderWithProviders(<LauncherShowcaseSection />);

    expect(screen.getByTestId("mock-main-layout")).toBeInTheDocument();
    expect(screen.getByText("SIMULADOR EN VIVO")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reiniciar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pantalla Completa/i }),
    ).toBeInTheDocument();
  });

  it("toggles fullscreen mode for simulator", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LauncherShowcaseSection />);

    const fullscreenBtn = screen.getByRole("button", {
      name: /Pantalla Completa/i,
    });
    await user.click(fullscreenBtn);

    expect(
      screen.getByRole("button", { name: /Reducir/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Reducir/i }));
    expect(
      screen.getByRole("button", { name: /Pantalla Completa/i }),
    ).toBeInTheDocument();
  });

  it("switches benchmark metrics", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LauncherShowcaseSection />);

    // Default metric is RAM
    expect(screen.getByText("38.4 MB")).toBeInTheDocument();

    // Switch to Startup
    const startupBtn = screen.getByRole("button", {
      name: /Arranque \(Seg\)/i,
    });
    await user.click(startupBtn);
    expect(screen.getAllByText("0.6s").length).toBeGreaterThanOrEqual(1);

    // Switch to FPS
    const fpsBtn = screen.getByRole("button", { name: /Ganancia FPS \(%\)/i });
    await user.click(fpsBtn);
    expect(screen.getAllByText("+140% FPS").length).toBeGreaterThanOrEqual(1);
  });

  it("switches OS download option", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LauncherShowcaseSection />);

    // Switch to macOS
    const macBtn = screen.getByRole("button", {
      name: /macOS \(Apple Silicon & Intel\)/i,
    });
    await user.click(macBtn);
    expect(screen.getByText("Universal DMG para macOS")).toBeInTheDocument();

    // Switch to Linux
    const linuxBtn = screen.getByRole("button", {
      name: /Linux \(AppImage\)/i,
    });
    await user.click(linuxBtn);
    expect(
      screen.getByText("Portable AppImage para Linux"),
    ).toBeInTheDocument();
  });

  it("shows, displays, and copies SHA-256 checksum", () => {
    renderWithProviders(<LauncherShowcaseSection />);

    const toggleChecksumBtn = screen.getByRole("button", {
      name: /Ver Hashes SHA-256 de Verificación/i,
    });
    fireEvent.click(toggleChecksumBtn);

    expect(screen.getByText(/Ocultar Hashes SHA-256/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole("button", { name: /Copiar/i });
    fireEvent.click(copyBtn);

    expect(mockWriteText).toHaveBeenCalledWith(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(screen.getByText("Copiado")).toBeInTheDocument();
  });
});
