import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { LogsPage } from "@/components/Launcher/LogsPage";
import { renderWithProviders } from "@/utils/test-utils";

// Mock the mockLauncherState module
const mockGetLogs = vi.fn();
const mockClearLogs = vi.fn();
const mockGetLogText = vi.fn();

vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    getLogs: (...args: unknown[]) => mockGetLogs(...args),
    clearLogs: (...args: unknown[]) => mockClearLogs(...args),
    getLogText: (...args: unknown[]) => mockGetLogText(...args),
  };
});

const SAMPLE_LOGS = [
  {
    timestamp: "2026-09-04T12:00:00.000Z",
    level: "info" as const,
    category: "Launcher",
    message: "Aplicación iniciada correctamente",
  },
  {
    timestamp: "2026-09-04T12:01:00.000Z",
    level: "error" as const,
    category: "Auth",
    message: "Error de autenticación con Microsoft",
  },
  {
    timestamp: "2026-09-04T12:02:00.000Z",
    level: "warn" as const,
    message: "Java no encontrado en PATH",
  },
  {
    timestamp: "2026-09-04T12:03:00.000Z",
    level: "debug" as const,
    category: "Network",
    message: "Ping al servidor: 45ms",
  },
];

describe("Launcher/LogsPage", () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLogs.mockReturnValue(SAMPLE_LOGS);
    mockGetLogText.mockReturnValue(
      SAMPLE_LOGS.map(
        (e) =>
          `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.category ? `[${e.category}] ` : ""}${e.message}`,
      ).join("\n"),
    );
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  it("renders header and log entries on mount", async () => {
    renderWithProviders(<LogsPage />);

    expect(screen.getByText("Registros del Launcher")).toBeInTheDocument();
    expect(screen.getByText("Diagnóstico")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Aplicación iniciada correctamente"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Error de autenticación con Microsoft"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Java no encontrado en PATH"),
    ).toBeInTheDocument();
  });

  it("displays level labels with correct text", async () => {
    renderWithProviders(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText("INFO")).toBeInTheDocument();
    });
    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("WARN")).toBeInTheDocument();
    expect(screen.getByText("DEBUG")).toBeInTheDocument();
  });

  it("displays category badges when present", async () => {
    renderWithProviders(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText("[Launcher]")).toBeInTheDocument();
    });
    expect(screen.getByText("[Auth]")).toBeInTheDocument();
    expect(screen.getByText("[Network]")).toBeInTheDocument();
  });

  it("shows empty state when there are no logs", async () => {
    mockGetLogs.mockReturnValue([]);
    renderWithProviders(<LogsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No hay registros disponibles."),
      ).toBeInTheDocument();
    });
  });

  it("calls clearLogs and refreshes when Limpiar button is clicked", async () => {
    renderWithProviders(<LogsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Aplicación iniciada correctamente"),
      ).toBeInTheDocument();
    });

    // After clearing, return empty
    mockClearLogs.mockImplementation(() => {});
    mockGetLogs.mockReturnValue([]);

    const clearBtn = screen.getByLabelText("Limpiar registros");
    fireEvent.click(clearBtn);

    expect(mockClearLogs).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(
        screen.getByText("No hay registros disponibles."),
      ).toBeInTheDocument();
    });
  });

  it("copies log text to clipboard when Copiar button is clicked", async () => {
    renderWithProviders(<LogsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Aplicación iniciada correctamente"),
      ).toBeInTheDocument();
    });

    const copyBtn = screen.getByLabelText(
      "Copiar registros al portapapeles",
    );
    fireEvent.click(copyBtn);

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining("Aplicación iniciada correctamente"),
    );
  });

  it("refreshes logs when refresh button is clicked", async () => {
    renderWithProviders(<LogsPage />);

    await waitFor(() => {
      expect(mockGetLogs).toHaveBeenCalledTimes(1);
    });

    const refreshBtn = screen.getByLabelText("Actualizar registros");
    fireEvent.click(refreshBtn);

    expect(mockGetLogs).toHaveBeenCalledTimes(2);
  });
});
