import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TicketsManager from "@/components/Admin/TicketsManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useAdminTickets: vi.fn(),
  useDeleteTicket: vi.fn(),
}));

describe("Admin/TicketsManager", () => {
  const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});

  const mockTicketsList = [
    {
      id: 101,
      user_id: "user-123",
      subject: "No puedo reclamar mi rango VIP",
      priority: "high",
      status: "open",
      created_at: "2026-06-01T12:00:00Z",
      profiles: { username: "CraftMaster" },
    },
    {
      id: 102,
      user_id: "user-456",
      subject: "Bug con la textura de la espada abisal",
      priority: "medium",
      status: "pending",
      created_at: "2026-06-02T14:00:00Z",
      profiles: { username: "NetherKnight" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    vi.mocked(adminDataHooks.useAdminTickets).mockReturnValue({
      data: mockTicketsList,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminDataHooks.useAdminTickets>);

    vi.mocked(adminDataHooks.useDeleteTicket).mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDeleteTicket>);
  });

  it("renders search bar, new ticket button, and tickets table", () => {
    renderWithProviders(<TicketsManager />);

    expect(screen.getByRole("searchbox", { name: /Buscar tickets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nuevo Ticket/i })).toBeInTheDocument();

    expect(screen.getByText("No puedo reclamar mi rango VIP")).toBeInTheDocument();
    expect(screen.getByText("CraftMaster")).toBeInTheDocument();

    expect(screen.getByText("Bug con la textura de la espada abisal")).toBeInTheDocument();
    expect(screen.getByText("NetherKnight")).toBeInTheDocument();
  });

  it("renders empty state when there are no tickets", () => {
    vi.mocked(adminDataHooks.useAdminTickets).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminDataHooks.useAdminTickets>);

    renderWithProviders(<TicketsManager mockTickets={[]} />);
    expect(screen.getByText(/No se encontraron tickets/i)).toBeInTheDocument();
  });

  it("opens create ticket modal when new ticket button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TicketsManager />);

    const newTicketBtn = screen.getByRole("button", { name: /Nuevo Ticket/i });
    await user.click(newTicketBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens ticket detail modal when view details button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TicketsManager mockMessages={{ 101: [] }} />);

    const viewBtns = screen.getAllByRole("button", { name: /Ver detalles/i });
    await user.click(viewBtns[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("allows selecting tickets and triggers bulk delete", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TicketsManager />);

    const selectAllCheckbox = screen.getByRole("checkbox", { name: /Seleccionar todos los tickets/i });
    await user.click(selectAllCheckbox);

    const deleteSelectedBtn = screen.getByRole("button", { name: /Eliminar.*\(2\)/i });
    expect(deleteSelectedBtn).toBeInTheDocument();

    await user.click(deleteSelectedBtn);

    // Confirmation dialog appears - button has exact text "Eliminar"
    const confirmBtn = screen.getByRole("button", { name: /^Eliminar$/i });
    await user.click(confirmBtn);

    expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(2);
  });
});
