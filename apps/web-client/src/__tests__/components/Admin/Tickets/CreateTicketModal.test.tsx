import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import CreateTicketModal from "@/components/Admin/Tickets/CreateTicketModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
      if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
      return key;
    },
    i18n: { language: "es" },
  }),
}));

vi.mock("../../../services/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "mock-token" } },
      }),
    },
  },
}));

vi.mock("../../../services/adminAuth", () => ({
  getAuthHeaders: vi
    .fn()
    .mockReturnValue({ Authorization: "Bearer mock-token" }),
}));

describe("CreateTicketModal", () => {
  const defaultUser = { id: "user-123" };
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    user: defaultUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);
  });

  it("renders modal dialog with form fields", () => {
    renderWithProviders(<CreateTicketModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Nuevo Ticket",
    );
    expect(screen.getByLabelText("Asunto")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByLabelText("Prioridad")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crear Ticket" }),
    ).toBeInTheDocument();
  });

  it("shows alert if subject is missing when submitting", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTicketModal {...defaultProps} />);

    const submitBtn = screen.getByRole("button", { name: "Crear Ticket" });
    await user.click(submitBtn);

    expect(screen.getByText("Falta el asunto")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("creates ticket successfully and calls onSuccess and onClose", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    renderWithProviders(
      <CreateTicketModal
        {...defaultProps}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    const subjectInput = screen.getByLabelText("Asunto");
    const descInput = screen.getByLabelText("Descripción");
    const prioritySelect = screen.getByLabelText("Prioridad");

    await user.type(subjectInput, "VIP Rank Missing");
    await user.type(
      descInput,
      "I purchased VIP rank yesterday but still do not have it.",
    );
    await user.selectOptions(prioritySelect, "high");

    const submitBtn = screen.getByRole("button", { name: "Crear Ticket" });
    await user.click(submitBtn);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tickets"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          user_id: "user-123",
          subject: "VIP Rank Missing",
          description:
            "I purchased VIP rank yesterday but still do not have it.",
          priority: "high",
        }),
      }),
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking close button or cancel", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <CreateTicketModal {...defaultProps} onClose={onClose} />,
    );

    const closeBtn = screen.getByRole("button", { name: "Cerrar modal" });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await user.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
