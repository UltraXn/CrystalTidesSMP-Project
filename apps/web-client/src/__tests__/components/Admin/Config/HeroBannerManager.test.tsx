import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import HeroBannerManager, {
  HeroSlide,
} from "@/components/Admin/Config/HeroBannerManager";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("@/services/uploadService", () => ({
  uploadImage: vi
    .fn()
    .mockResolvedValue("https://example.com/banner-uploaded.png"),
}));

describe("HeroBannerManager", () => {
  const mockOnUpdate = vi.fn();

  const customSlides: HeroSlide[] = [
    {
      id: 101,
      image: "https://example.com/custom-1.jpg",
      title: "Evento Fin de Semana",
      text: "Doble experiencia en todas las profesiones.",
      buttonText: "Ver Evento",
      link: "/events/weekend",
    },
  ];

  it("renders custom slides when passed in settings", () => {
    // Arrange & Act
    renderWithProviders(
      <HeroBannerManager
        settings={{ hero_slides: JSON.stringify(customSlides) }}
        onUpdate={mockOnUpdate}
        saving={null}
      />,
    );

    // Assert
    expect(screen.getByText("Evento Fin de Semana")).toBeInTheDocument();
    expect(
      screen.getByText("Doble experiencia en todas las profesiones."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ver Evento/)).toBeInTheDocument();
  });

  it("opens creation form when clicking add slide button", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <HeroBannerManager
        settings={{ hero_slides: JSON.stringify(customSlides) }}
        onUpdate={mockOnUpdate}
        saving={null}
      />,
    );

    // Act: click Add Slide
    const addBtn = screen.getByRole("button", {
      name: /admin\.settings\.hero\.new_slide/i,
    });
    await user.click(addBtn);

    // Assert form is open
    expect(screen.getByPlaceholderText("Ej: Nueva Temporada")).toHaveValue("");
  });

  it("creates a new slide and invokes onUpdate with updated list", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <HeroBannerManager
        settings={{ hero_slides: JSON.stringify(customSlides) }}
        onUpdate={mockOnUpdate}
        saving={null}
      />,
    );

    // Act: open form and type fields
    const addBtn = screen.getByRole("button", {
      name: /admin\.settings\.hero\.new_slide/i,
    });
    await user.click(addBtn);

    await user.type(
      screen.getByPlaceholderText("https://..."),
      "https://example.com/banner-new.jpg",
    );
    await user.type(
      screen.getByPlaceholderText("Ej: Nueva Temporada"),
      "Torneo PvP Abisal",
    );
    await user.type(
      screen.getByPlaceholderText("Descripción corta..."),
      "Premios en metálico y rangos exclusivos.",
    );
    await user.type(
      screen.getByPlaceholderText("Ej: Jugar Ahora"),
      "Inscribirse",
    );
    await user.type(
      screen.getByPlaceholderText("/tienda o https://..."),
      "/events/pvp",
    );

    const saveBtn = screen.getByRole("button", {
      name: /admin\.settings\.hero\.save_btn/i,
    });
    await user.click(saveBtn);

    // Assert
    expect(mockOnUpdate).toHaveBeenCalledWith(
      "hero_slides",
      expect.stringContaining("Torneo PvP Abisal"),
    );
    const parsed = JSON.parse(mockOnUpdate.mock.calls[0][1]) as HeroSlide[];
    expect(parsed).toHaveLength(2);
    expect(parsed[1].title).toBe("Torneo PvP Abisal");
  });

  it("edits an existing slide", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <HeroBannerManager
        settings={{ hero_slides: JSON.stringify(customSlides) }}
        onUpdate={mockOnUpdate}
        saving={null}
      />,
    );

    // Act: click edit on first slide
    const editBtn = screen.getByRole("button", {
      name: /Editar slide: Evento Fin de Semana/i,
    });
    await user.click(editBtn);

    const titleInput = screen.getByDisplayValue("Evento Fin de Semana");
    await user.clear(titleInput);
    await user.type(titleInput, "Evento Triple Experiencia");

    const saveBtn = screen.getByRole("button", {
      name: /admin\.settings\.hero\.save_btn/i,
    });
    await user.click(saveBtn);

    // Assert
    expect(mockOnUpdate).toHaveBeenCalledWith(
      "hero_slides",
      expect.stringContaining("Evento Triple Experiencia"),
    );
  });

  it("deletes a slide when confirmed", async () => {
    // Arrange
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithProviders(
      <HeroBannerManager
        settings={{ hero_slides: JSON.stringify(customSlides) }}
        onUpdate={mockOnUpdate}
        saving={null}
      />,
    );

    // Act: click delete
    const deleteBtn = screen.getByRole("button", {
      name: /Eliminar slide: Evento Fin de Semana/i,
    });
    await user.click(deleteBtn);

    // Assert
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnUpdate).toHaveBeenCalledWith("hero_slides", "[]");

    confirmSpy.mockRestore();
  });

  it("cancels form editing when cancel button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <HeroBannerManager
        settings={{ hero_slides: JSON.stringify(customSlides) }}
        onUpdate={mockOnUpdate}
        saving={null}
      />,
    );

    // Act: open create form and cancel
    const addBtn = screen.getByRole("button", {
      name: /admin\.settings\.hero\.new_slide/i,
    });
    await user.click(addBtn);

    const cancelBtn = screen.getByRole("button", {
      name: /admin\.settings\.hero\.cancel_btn/i,
    });
    await user.click(cancelBtn);

    // Assert: form is closed
    expect(
      screen.queryByRole("button", {
        name: /admin\.settings\.hero\.cancel_btn/i,
      }),
    ).not.toBeInTheDocument();
  });
});
