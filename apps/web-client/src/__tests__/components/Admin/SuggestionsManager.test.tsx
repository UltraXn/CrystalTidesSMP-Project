import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestionsManager from "@/components/Admin/SuggestionsManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useAdminSuggestions: vi.fn(),
  useUpdateSuggestionStatus: vi.fn(),
  useDeleteSuggestion: vi.fn(),
}));

describe("Admin/SuggestionsManager", () => {
  const mockUpdateStatusMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const mockSuggestionsList = [
    {
      id: 1,
      nickname: "AlexCrafter",
      type: "gameplay",
      status: "pending" as const,
      message: "Los jugadores nuevos necesitan un lugar para almacenar ítems temporales.",
      created_at: "2026-06-01T10:00:00Z",
    },
    {
      id: 2,
      nickname: "SteveBuilder",
      type: "economy",
      status: "approved" as const,
      message: "El impuesto de venta actual es demasiado alto en el mercado global.",
      created_at: "2026-06-02T12:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminSuggestions).mockReturnValue({
      data: mockSuggestionsList,
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSuggestions>);

    vi.mocked(adminDataHooks.useUpdateSuggestionStatus).mockReturnValue({
      mutate: mockUpdateStatusMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateSuggestionStatus>);

    vi.mocked(adminDataHooks.useDeleteSuggestion).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDeleteSuggestion>);
  });

  it("renders suggestions list with user info and messages", () => {
    renderWithProviders(<SuggestionsManager />);

    expect(screen.getByText("AlexCrafter")).toBeInTheDocument();
    expect(screen.getByText("Los jugadores nuevos necesitan un lugar para almacenar ítems temporales.")).toBeInTheDocument();

    expect(screen.getByText("SteveBuilder")).toBeInTheDocument();
    expect(screen.getByText("El impuesto de venta actual es demasiado alto en el mercado global.")).toBeInTheDocument();
  });

  it("renders loader during loading state", () => {
    vi.mocked(adminDataHooks.useAdminSuggestions).mockReturnValue({
      data: null,
      isLoading: true,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSuggestions>);

    const { container } = renderWithProviders(<SuggestionsManager />);
    expect(container.querySelector(".premium-loader-container")).toBeInTheDocument();
  });

  it("renders empty state when there are no matching suggestions", () => {
    vi.mocked(adminDataHooks.useAdminSuggestions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSuggestions>);

    renderWithProviders(<SuggestionsManager />);
    expect(screen.getByText("No hay sugerencias")).toBeInTheDocument();
  });

  it("calls updateStatusMutation when approving a suggestion", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionsManager />);

    const approveBtn = screen.getByRole("button", { name: /Aprobar sugerencia de AlexCrafter/i });
    await user.click(approveBtn);

    expect(mockUpdateStatusMutate).toHaveBeenCalledWith({ id: 1, status: "approved" });
  });

  it("calls updateStatusMutation when rejecting a suggestion", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionsManager />);

    const rejectBtn = screen.getByRole("button", { name: /Rechazar sugerencia de AlexCrafter/i });
    await user.click(rejectBtn);

    expect(mockUpdateStatusMutate).toHaveBeenCalledWith({ id: 1, status: "rejected" });
  });

  it("opens delete modal and calls deleteMutation upon confirmation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SuggestionsManager />);

    const deleteBtn = screen.getByRole("button", { name: /Eliminar sugerencia de AlexCrafter/i });
    await user.click(deleteBtn);

    expect(screen.getByText("admin.suggestions.delete_modal.title")).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: "admin.suggestions.delete_modal.confirm" });
    await user.click(confirmDeleteBtn);

    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });
});
