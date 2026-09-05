import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WikiArticle } from "@/services/wikiService";
import WikiManager from "@/components/Admin/WikiManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

// Mock hooks
vi.mock("@/hooks/useAdminData", () => ({
  useWikiArticles: vi.fn(),
  useCreateWikiArticle: vi.fn(),
  useUpdateWikiArticle: vi.fn(),
  useDeleteWikiArticle: vi.fn(),
}));

// Mock wikiService categories
vi.mock("@/services/wikiService", () => ({
  WIKI_CATEGORIES: [
    { id: "bosses", icon: "🐉", name: "Bosses" },
    { id: "items", icon: "🗡️", name: "Items" },
    { id: "general", icon: "📖", name: "General" },
  ],
}));

describe("Admin/WikiManager", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const mockArticles = [
    {
      id: 1,
      title: "Dragón del Abismo",
      slug: "dragon-del-abismo",
      content: "El jefe más poderoso del servidor",
      category: "bosses",
      boss_mod_name: "Cataclysm",
      model_3d_url: "https://example.com/dragon.glb",
    },
    {
      id: 2,
      title: "Espada Celestial",
      slug: "espada-celestial",
      content: "Un arma legendaria",
      category: "items",
      boss_mod_name: "Twilight Forest",
      model_3d_url: null,
    },
    {
      id: 3,
      title: "Guía de Inicio",
      slug: "guia-inicio",
      content: "Cómo empezar",
      category: "general",
      boss_mod_name: null,
      model_3d_url: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useWikiArticles).mockReturnValue({
      data: mockArticles,
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useWikiArticles>);

    vi.mocked(adminDataHooks.useCreateWikiArticle).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useCreateWikiArticle>);

    vi.mocked(adminDataHooks.useUpdateWikiArticle).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateWikiArticle>);

    vi.mocked(adminDataHooks.useDeleteWikiArticle).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDeleteWikiArticle>);
  });

  it("renders all article titles", () => {
    renderWithProviders(<WikiManager />);

    expect(screen.getByText("Dragón del Abismo")).toBeInTheDocument();
    expect(screen.getByText("Espada Celestial")).toBeInTheDocument();
    expect(screen.getByText("Guía de Inicio")).toBeInTheDocument();
  });

  it("renders search input and create button", () => {
    renderWithProviders(<WikiManager />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByText("admin.wiki.create_btn")).toBeInTheDocument();
  });

  it("filters articles by search term", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiManager />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "Dragón");

    expect(screen.getByText("Dragón del Abismo")).toBeInTheDocument();
    expect(screen.queryByText("Espada Celestial")).not.toBeInTheDocument();
    expect(screen.queryByText("Guía de Inicio")).not.toBeInTheDocument();
  });

  it("supports mockArticles prop override", () => {
    const custom = [
      {
        id: 99,
        title: "Artículo Mock",
        slug: "mock",
        content: "test",
        category: "general",
        boss_mod_name: null,
        model_3d_url: null,
      },
    ];

    renderWithProviders(
      <WikiManager mockArticles={custom as unknown as WikiArticle[]} />,
    );

    expect(screen.getByText("Artículo Mock")).toBeInTheDocument();
    expect(screen.queryByText("Dragón del Abismo")).not.toBeInTheDocument();
  });

  it("shows delete confirmation modal when article delete is triggered", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiManager />);

    // WikiArticleList should render delete buttons
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete|eliminar/i,
    });
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      // ConfirmationModal should appear
      expect(
        screen.getByText("Eliminar Artículo de la Wiki"),
      ).toBeInTheDocument();
    }
  });

  it("calls deleteMutation on confirm delete", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiManager />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete|eliminar/i,
    });
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);

      const confirmBtn = screen.getByTestId("confirmation-modal-confirm");
      await user.click(confirmBtn);

      expect(mockDeleteMutate).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Object),
      );
    }
  });
});
