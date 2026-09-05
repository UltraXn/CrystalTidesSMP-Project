import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WikiTreeSidebar from "@/components/Wiki/WikiTreeSidebar";
import { renderWithProviders } from "@/utils/test-utils";
import { WikiArticle } from "@/services/wikiService";

describe("WikiTreeSidebar", () => {
  const sampleArticles: WikiArticle[] = [
    {
      id: 1,
      slug: "ender-dragon",
      title: "Ender Dragon",
      content: "Boss of the End dimension.",
      category: "bosses",
      boss_mod_name: "Vanilla",
      author_id: "author-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      slug: "guia-comandos",
      title: "Comandos Básicos",
      content: "Lista de comandos survival.",
      category: "guias_generales",
      author_id: "author-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it("renders total articles count and category sections", () => {
    renderWithProviders(<WikiTreeSidebar articles={sampleArticles} />);

    expect(screen.getByText(/2 Entidades & Guías/i)).toBeInTheDocument();
    expect(screen.getByText(/Jefes Supremos & Bosses/i)).toBeInTheDocument();
    expect(screen.getByText(/Guías & Comandos/i)).toBeInTheDocument();
  });

  it("filters articles list by search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiTreeSidebar articles={sampleArticles} />);

    const searchInput = screen.getByLabelText(/Filtrar compendio Wiki/i);
    await user.type(searchInput, "Ender");

    expect(screen.getByText("Ender Dragon")).toBeInTheDocument();
    expect(screen.queryByText("Comandos Básicos")).not.toBeInTheDocument();
  });

  it("displays empty message when search yields no matches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiTreeSidebar articles={sampleArticles} />);

    const searchInput = screen.getByLabelText(/Filtrar compendio Wiki/i);
    await user.type(searchInput, "NonexistentMobXYZ");

    expect(
      screen.getByText(/No hay artículos coincidentes/i),
    ).toBeInTheDocument();
  });
});
