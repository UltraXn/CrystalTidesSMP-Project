import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import LocationsManager from "@/components/Admin/Config/LocationsManager";
import { WorldLocation } from "@/services/locationService";

const {
  mockGetLocations,
  mockCreateLocation,
  mockUpdateLocation,
  mockDeleteLocation,
} = vi.hoisted(() => {
  return {
    mockGetLocations: vi.fn(),
    mockCreateLocation: vi.fn(),
    mockUpdateLocation: vi.fn(),
    mockDeleteLocation: vi.fn(),
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("@/services/locationService", () => ({
  getLocations: mockGetLocations,
  createLocation: mockCreateLocation,
  updateLocation: mockUpdateLocation,
  deleteLocation: mockDeleteLocation,
}));

vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "mock-auth-token" } },
      }),
    },
  },
}));

describe("LocationsManager", () => {
  const sampleLocations: WorldLocation[] = [
    {
      id: 1,
      title: "Gran Biblioteca de Cristal",
      description: "Antiguo repositorio de sabiduría abisal.",
      long_description:
        "Construida por los primeros sabios del archipiélago...",
      coords: "100, 64, -250",
      image_url: "https://example.com/library.png",
      is_coming_soon: false,
      sort_order: 1,
      authors: [{ name: "Alex", role: "architect" }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocations.mockResolvedValue(sampleLocations);
  });

  it("renders loader while locations are loading", () => {
    // Arrange
    mockGetLocations.mockReturnValue(new Promise(() => {}));

    // Act
    renderWithProviders(<LocationsManager />);

    // Assert
    expect(screen.getByAltText("Crystal Tides")).toBeInTheDocument();
  });

  it("renders locations list after fetching", async () => {
    // Arrange & Act
    renderWithProviders(<LocationsManager />);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("Gran Biblioteca de Cristal"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Antiguo repositorio de sabiduría abisal."),
      ).toBeInTheDocument();
      expect(screen.getByText("100, 64, -250")).toBeInTheDocument();
    });
  });

  it("opens creation form and saves a new location", async () => {
    // Arrange
    mockCreateLocation.mockResolvedValue({ id: 2, title: "Fortaleza Oscura" });

    renderWithProviders(<LocationsManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Gran Biblioteca de Cristal"),
      ).toBeInTheDocument();
    });

    // Act: click create button
    const createBtn = screen.getByRole("button", { name: /Nuevo Lugar/i });
    fireEvent.click(createBtn);

    // Fill basic fields
    const titleInput = screen.getByPlaceholderText(
      "Ej: Gran Biblioteca de Cristal",
    );
    fireEvent.change(titleInput, { target: { value: "Fortaleza Oscura" } });

    const descInput = screen.getByLabelText(/Descripción Corta/i);
    fireEvent.change(descInput, {
      target: { value: "Bastión de los caballeros caídos." },
    });

    // Save
    const saveBtn = screen.getByRole("button", { name: /Guardar Registro/i });
    fireEvent.click(saveBtn);

    // Assert
    await waitFor(() => {
      expect(mockCreateLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Fortaleza Oscura",
          description: "Bastión de los caballeros caídos.",
        }),
        "mock-auth-token",
      );
    });
  });

  it("opens edit form and saves changes for existing location", async () => {
    // Arrange
    mockUpdateLocation.mockResolvedValue({
      id: 1,
      title: "Biblioteca de Cristal Renovada",
    });

    renderWithProviders(<LocationsManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Gran Biblioteca de Cristal"),
      ).toBeInTheDocument();
    });

    // Act: click edit button on card
    const editBtn = screen.getByRole("button", {
      name: /Editar localización: Gran Biblioteca de Cristal/i,
    });
    fireEvent.click(editBtn);

    const titleInput = screen.getByDisplayValue("Gran Biblioteca de Cristal");
    fireEvent.change(titleInput, {
      target: { value: "Biblioteca de Cristal Renovada" },
    });

    const saveBtn = screen.getByRole("button", { name: /Guardar Registro/i });
    fireEvent.click(saveBtn);

    // Assert
    await waitFor(() => {
      expect(mockUpdateLocation).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: "Biblioteca de Cristal Renovada",
        }),
        "mock-auth-token",
      );
    });
  });

  it("deletes a location via ConfirmationModal", async () => {
    // Arrange
    const user = userEvent.setup();
    mockDeleteLocation.mockResolvedValue(undefined);

    renderWithProviders(<LocationsManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Gran Biblioteca de Cristal"),
      ).toBeInTheDocument();
    });

    // Act: click delete button
    const deleteBtn = screen.getByRole("button", {
      name: /Eliminar localización: Gran Biblioteca de Cristal/i,
    });
    await user.click(deleteBtn);

    // Confirmation modal
    const confirmBtn = screen.getByTestId("confirmation-modal-confirm");
    await user.click(confirmBtn);

    // Assert
    await waitFor(() => {
      expect(mockDeleteLocation).toHaveBeenCalledWith(1, "mock-auth-token");
    });
  });

  it("adds and removes authors in creation form", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(<LocationsManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Gran Biblioteca de Cristal"),
      ).toBeInTheDocument();
    });

    // Act: open creation form
    const createBtn = screen.getByRole("button", { name: /Nuevo Lugar/i });
    await user.click(createBtn);

    // Add author
    const authorInput = screen.getByPlaceholderText("Nick del Autor");
    await user.type(authorInput, "BobElConstructor");

    const addAuthorBtn = screen.getByRole("button", { name: "Añadir autor" });
    await user.click(addAuthorBtn);

    expect(screen.getByText("BobElConstructor")).toBeInTheDocument();

    // Remove author
    const removeAuthorBtn = screen.getByRole("button", {
      name: /Eliminar autor: BobElConstructor/i,
    });
    await user.click(removeAuthorBtn);

    expect(screen.queryByText("BobElConstructor")).not.toBeInTheDocument();
  });
});
