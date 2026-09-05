import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WikiCatalogGrid from "@/components/Wiki/WikiCatalogGrid";
import { renderWithProviders } from "@/utils/test-utils";
import { WikiArticle } from "@/services/wikiService";

describe("WikiCatalogGrid", () => {
  const sampleArticles: WikiArticle[] = [
    {
      id: 1,
      slug: "leviathan",
      title: "Ancient Leviathan",
      content: "Ruler of the ocean abyss.",
      category: "bosses",
      boss_mod_name: "Cataclysm",
      boss_location: "Abyssal Chasm",
      author_id: "author-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      slug: "axolotl-pet",
      title: "Golden Axolotl",
      content: "Friendly aquatic companion.",
      category: "mobs_pacificos",
      boss_mod_name: "Vanilla",
      author_id: "author-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it("renders catalog category tabs and articles", () => {
    renderWithProviders(<WikiCatalogGrid articles={sampleArticles} />);

    expect(screen.getByText("Todo el Compendio")).toBeInTheDocument();
    expect(screen.getByText("Jefes Supremos")).toBeInTheDocument();
    expect(screen.getByText("Fauna & Mascotas")).toBeInTheDocument();

    expect(screen.getByText("Ancient Leviathan")).toBeInTheDocument();
    expect(screen.getByText("Golden Axolotl")).toBeInTheDocument();
  });

  it("filters articles when switching category tab", async () => {
    const handleCategoryChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <WikiCatalogGrid
        articles={sampleArticles}
        onCategoryChange={handleCategoryChange}
      />,
    );

    const bossesTab = screen.getByText("Jefes Supremos");
    await user.click(bossesTab);

    expect(handleCategoryChange).toHaveBeenCalledWith("bosses");
    expect(screen.getByText("Ancient Leviathan")).toBeInTheDocument();
    expect(screen.queryByText("Golden Axolotl")).not.toBeInTheDocument();
  });

  it("filters articles by search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiCatalogGrid articles={sampleArticles} />);

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
    await user.type(searchInput, "Leviathan");

    expect(screen.getByText("Ancient Leviathan")).toBeInTheDocument();
    expect(screen.queryByText("Golden Axolotl")).not.toBeInTheDocument();
  });
});
