import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import TicketTable from "@/components/Admin/Tickets/TicketTable";
import { Ticket } from "@/components/Admin/Tickets/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
      if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
      return key;
    },
    i18n: { language: "es" },
  }),
}));

describe("TicketTable", () => {
  const mockTickets: Ticket[] = [
    {
      id: 1,
      user_id: "user-001",
      subject: "Cannot login to game server",
      description: "Stuck on encrypting screen",
      priority: "high",
      status: "open",
      created_at: "2026-03-01T10:00:00Z",
      profiles: {
        username: "GamerAlex",
        avatar_url: "https://example.com/avatar1.png",
      },
    },
    {
      id: 2,
      user_id: "user-002",
      subject: "Suggestion for spawn shop",
      description: "Add more glowstone blocks",
      priority: "low",
      status: "resolved",
      created_at: "2026-03-02T10:00:00Z",
    },
  ];

  const defaultProps = {
    tickets: mockTickets,
    loading: false,
    selectedTicketIds: [1],
    toggleSelectAll: vi.fn(),
    toggleSelectTicket: vi.fn(),
    onViewTicket: vi.fn(),
  };

  it("renders loading state when loading is true", () => {
    renderWithProviders(<TicketTable {...defaultProps} loading={true} />);
    expect(screen.getByText("Buscando tickets...")).toBeInTheDocument();
  });

  it("renders empty message when tickets array is empty", () => {
    renderWithProviders(<TicketTable {...defaultProps} tickets={[]} />);
    expect(screen.getByText("No se encontraron tickets")).toBeInTheDocument();
  });

  it("renders table headers and ticket rows", () => {
    renderWithProviders(<TicketTable {...defaultProps} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("GamerAlex")).toBeInTheDocument();
    expect(screen.getByText("Cannot login to game server")).toBeInTheDocument();

    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("user-002")).toBeInTheDocument();
    expect(screen.getByText("Suggestion for spawn shop")).toBeInTheDocument();
  });

  it("handles select all and individual select checkboxes", async () => {
    const user = userEvent.setup();
    const toggleSelectAll = vi.fn();
    const toggleSelectTicket = vi.fn();

    renderWithProviders(
      <TicketTable
        {...defaultProps}
        toggleSelectAll={toggleSelectAll}
        toggleSelectTicket={toggleSelectTicket}
      />,
    );

    const selectAllCheckbox = screen.getByLabelText(
      "Seleccionar todos los tickets",
    );
    await user.click(selectAllCheckbox);
    expect(toggleSelectAll).toHaveBeenCalledTimes(1);

    const ticketCheckbox = screen.getByLabelText("Seleccionar ticket #2");
    await user.click(ticketCheckbox);
    expect(toggleSelectTicket).toHaveBeenCalledWith(2);
  });

  it("calls onViewTicket when clicking a row or the view button", async () => {
    const user = userEvent.setup();
    const onViewTicket = vi.fn();

    renderWithProviders(
      <TicketTable {...defaultProps} onViewTicket={onViewTicket} />,
    );

    const row = screen.getByText("Cannot login to game server");
    await user.click(row);
    expect(onViewTicket).toHaveBeenCalledWith(mockTickets[0]);

    const viewButtons = screen.getAllByTitle("Ver detalles");
    await user.click(viewButtons[1]);
    expect(onViewTicket).toHaveBeenCalledWith(mockTickets[1]);
  });
});
