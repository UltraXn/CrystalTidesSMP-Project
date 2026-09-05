import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsPage } from "@/components/Launcher/NewsPage";
import { renderWithProviders } from "@/utils/test-utils";

// Mock fetchNews
const mockFetchNews = vi.fn();

vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    fetchNews: (...args: unknown[]) => mockFetchNews(...args),
  };
});

const SAMPLE_POSTS = [
  {
    id: "1",
    title: "Lanzamiento Temporada 4",
    content: "Nueva dimensión submarina disponible.",
    category: "Anuncio",
    createdAt: "2026-09-04T12:00:00.000Z",
  },
  {
    id: "2",
    title: "Actualización 2.4.0",
    content: "Mejoras de rendimiento +140% FPS.",
    category: "Actualización",
    createdAt: "2026-09-03T12:00:00.000Z",
  },
  {
    id: "3",
    title: "Torneo de Maestrías",
    content: "Compite por 5,000 KC este fin de semana.",
    category: "Evento",
    createdAt: "2026-09-01T12:00:00.000Z",
  },
];

describe("Launcher/NewsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchNews.mockResolvedValue(SAMPLE_POSTS);
  });

  it("shows skeleton loaders while loading", () => {
    // Never resolve
    mockFetchNews.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<NewsPage />);

    expect(screen.getByText("Últimas Novedades")).toBeInTheDocument();
    expect(screen.getByText("Noticias")).toBeInTheDocument();
  });

  it("renders news posts after loading", async () => {
    renderWithProviders(<NewsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Lanzamiento Temporada 4"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Actualización 2.4.0")).toBeInTheDocument();
    expect(screen.getByText("Torneo de Maestrías")).toBeInTheDocument();
  });

  it("displays post categories and content", async () => {
    renderWithProviders(<NewsPage />);

    await waitFor(() => {
      expect(screen.getByText("Anuncio")).toBeInTheDocument();
    });
    expect(screen.getByText("Actualización")).toBeInTheDocument();
    expect(screen.getByText("Evento")).toBeInTheDocument();
    expect(
      screen.getByText("Nueva dimensión submarina disponible."),
    ).toBeInTheDocument();
  });

  it("shows empty state when no posts returned", async () => {
    mockFetchNews.mockResolvedValue([]);
    renderWithProviders(<NewsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No hay noticias disponibles por el momento.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("refreshes posts when Actualizar button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewsPage />);

    await waitFor(() => {
      expect(mockFetchNews).toHaveBeenCalledTimes(1);
    });

    const refreshBtn = screen.getByLabelText("Actualizar noticias");
    await user.click(refreshBtn);

    await waitFor(() => {
      expect(mockFetchNews).toHaveBeenCalledTimes(2);
    });
  });

  it("passes limit parameter to fetchNews", async () => {
    renderWithProviders(<NewsPage />);

    await waitFor(() => {
      expect(mockFetchNews).toHaveBeenCalledWith(20);
    });
  });
});
