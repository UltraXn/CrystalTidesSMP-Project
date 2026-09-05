import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import RulesEditor from "@/components/Admin/Config/RulesEditor";
import { Rule } from "@/hooks/useAdminData";

const {
  mockUseRules,
  mockUseCreateRule,
  mockUseUpdateRule,
  mockUseDeleteRule,
  mockUseTranslateText,
  mockCreateMutate,
  mockUpdateMutate,
  mockDeleteMutate,
  mockTranslateMutate,
} = vi.hoisted(() => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();
  const mockTranslateMutate = vi.fn();

  const mockUseRules = vi.fn();
  const mockUseCreateRule = vi.fn(() => ({
    mutate: mockCreateMutate,
    isPending: false,
  }));
  const mockUseUpdateRule = vi.fn(() => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }));
  const mockUseDeleteRule = vi.fn(() => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }));
  const mockUseTranslateText = vi.fn(() => ({
    mutate: mockTranslateMutate,
    isPending: false,
  }));

  return {
    mockUseRules,
    mockUseCreateRule,
    mockUseUpdateRule,
    mockUseDeleteRule,
    mockUseTranslateText,
    mockCreateMutate,
    mockUpdateMutate,
    mockDeleteMutate,
    mockTranslateMutate,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("@/hooks/useAdminData", () => ({
  useRules: mockUseRules,
  useCreateRule: mockUseCreateRule,
  useUpdateRule: mockUseUpdateRule,
  useDeleteRule: mockUseDeleteRule,
  useTranslateText: mockUseTranslateText,
}));

describe("RulesEditor", () => {
  const sampleRules: Rule[] = [
    {
      id: 1,
      category: "Comportamiento",
      title: "Respeto Mutuo",
      content: "No se tolerará el acoso ni insultos a otros usuarios.",
      title_en: "Mutual Respect",
      content_en:
        "Harassment and insults to other users will not be tolerated.",
      color: "#6366f1",
      sort_order: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRules.mockReturnValue({
      data: sampleRules,
      isLoading: false,
    });
  });

  it("renders loading text when loading rules", () => {
    // Arrange
    mockUseRules.mockReturnValue({
      data: [],
      isLoading: true,
    });

    // Act
    renderWithProviders(<RulesEditor />);

    // Assert
    expect(
      screen.getByText("Cargando reglas del servidor..."),
    ).toBeInTheDocument();
  });

  it("renders rules grouped by category", () => {
    // Arrange & Act
    renderWithProviders(<RulesEditor />);

    // Assert
    expect(screen.getByText("Comportamiento")).toBeInTheDocument();
    expect(screen.getByText("Respeto Mutuo")).toBeInTheDocument();
    expect(
      screen.getByText("No se tolerará el acoso ni insultos a otros usuarios."),
    ).toBeInTheDocument();
  });

  it("opens creation form and creates a new rule", async () => {
    mockCreateMutate.mockImplementation(
      (_params: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      },
    );
    renderWithProviders(<RulesEditor />);

    // Act: click Nueva Regla
    const addBtn = screen.getByRole('button', { name: /Nueva Regla/i });
    fireEvent.click(addBtn);

    // Fill form
    const titleInput = screen.getByPlaceholderText('Ej: PVP Consensuado');
    fireEvent.change(titleInput, { target: { value: 'Prohibido Hacks' } });

    const contentInput = screen.getByPlaceholderText('Descripción detallada de la regla...');
    fireEvent.change(contentInput, { target: { value: 'El uso de clientes modificados con ventajas acarrea sanción permanente.' } });

    const saveBtn = screen.getByRole('button', { name: /Guardar Regla/i });
    fireEvent.click(saveBtn);

    // Assert
    expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
            title: 'Prohibido Hacks',
            content: 'El uso de clientes modificados con ventajas acarrea sanción permanente.',
        }),
        expect.any(Object)
    );
  });

  it('opens edit form and updates existing rule', async () => {
    // Arrange
    mockUpdateMutate.mockImplementation((_params: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
    });

    renderWithProviders(<RulesEditor />);

    // Act: click edit button on card
    const editBtn = screen.getByRole('button', { name: 'Editar regla: Respeto Mutuo' });
    fireEvent.click(editBtn);

    const titleInput = screen.getByDisplayValue('Respeto Mutuo');
    fireEvent.change(titleInput, { target: { value: 'Respeto Mutuo y Convivencia' } });

    const saveBtn = screen.getByRole('button', { name: /Guardar Regla/i });
    fireEvent.click(saveBtn);

    // Assert
    expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
            id: 1,
            payload: expect.objectContaining({
                title: 'Respeto Mutuo y Convivencia',
            }),
        }),
        expect.any(Object)
    );
  });

  it("deletes a rule via ConfirmationModal", async () => {
    // Arrange
    const user = userEvent.setup();
    mockDeleteMutate.mockImplementation(
      (_id: number, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      },
    );

    renderWithProviders(<RulesEditor />);

    // Act: click delete button on card
    const deleteBtn = screen.getByRole("button", {
      name: "Eliminar regla: Respeto Mutuo",
    });
    await user.click(deleteBtn);

    // Modal confirm
    const confirmBtn = screen.getByTestId("confirmation-modal-confirm");
    await user.click(confirmBtn);

    // Assert
    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it("translates rule fields via translateMutation", async () => {
    // Arrange
    const user = userEvent.setup();
    mockTranslateMutate.mockImplementation(
      (
        _params: { text: string; targetLang: string },
        options?: { onSuccess?: (val: string) => void },
      ) => {
        options?.onSuccess?.("No Griefing Rule");
      },
    );

    renderWithProviders(<RulesEditor />);

    // Act: open creation form
    const addBtn = screen.getByRole("button", { name: /Nueva Regla/i });
    await user.click(addBtn);

    const titleInput = screen.getByPlaceholderText("Ej: PVP Consensuado");
    await user.type(titleInput, "Regla No Griefing");

    const translateBtn = screen.getAllByRole("button", {
      name: /Traducir a EN/i,
    });
    await user.click(translateBtn[0]);

    // Assert
    expect(mockTranslateMutate).toHaveBeenCalledWith(
      { text: "Regla No Griefing", targetLang: "en" },
      expect.any(Object),
    );
    expect(screen.getByDisplayValue("No Griefing Rule")).toBeInTheDocument();
  });
});
