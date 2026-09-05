import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import StaffNotes from "@/components/Admin/StaffHub/StaffNotes";

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn().mockReturnThis(),
};

vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              text: "Revisar logs del servidor",
              color: "rgba(139, 92, 246, 0.15)",
              date: "2026-03-01",
            },
          ],
        }),
      })),
    })),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "fake-token" } },
      }),
    },
  },
}));

vi.mock("@/services/adminAuth", () => ({
  getAuthHeaders: vi.fn(() => ({ Authorization: "Bearer fake-token" })),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("StaffNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("loads and renders staff notes from database", async () => {
    // Arrange & Act
    renderWithProviders(<StaffNotes />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Revisar logs del servidor")).toBeInTheDocument();
      expect(screen.getByText("Notas Rápidas")).toBeInTheDocument();
    });
  });

  it("opens create modal, types note, and creates it via API", async () => {
    // Arrange
    const user = userEvent.setup();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({
          id: 2,
          text: "Actualizar plugin de economía",
          color: "rgba(59, 130, 246, 0.15)",
          date: "2026-03-02",
        }),
      },
    );

    renderWithProviders(<StaffNotes />);
    await waitFor(() =>
      expect(screen.getByText("Revisar logs del servidor")).toBeInTheDocument(),
    );

    // Act: open modal
    const newNoteBtn = screen.getByRole("button", { name: /nueva nota/i });
    await user.click(newNoteBtn);

    // Assert modal is open
    const textarea = screen.getByRole("textbox", {
      name: "Contenido de la nota",
    });
    await user.type(textarea, "Actualizar plugin de economía");

    const saveBtn = screen.getByRole("button", { name: "Guardar Nota" });
    await user.click(saveBtn);

    // Assert API called and new note displayed
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/staff/notes"),
        expect.objectContaining({
          method: "POST",
        }),
      );
      expect(
        screen.getByText("Actualizar plugin de economía"),
      ).toBeInTheDocument();
    });
  });

  it("opens delete confirmation modal and confirms note deletion", async () => {
    // Arrange
    const user = userEvent.setup();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
      },
    );

    renderWithProviders(<StaffNotes />);
    await waitFor(() =>
      expect(screen.getByText("Revisar logs del servidor")).toBeInTheDocument(),
    );

    // Act: click delete button on note
    const deleteBtn = screen.getByTitle("Borrar");
    await user.click(deleteBtn);

    // Assert confirmation modal is open
    expect(screen.getByText("¿Eliminar Nota?")).toBeInTheDocument();

    // Act: confirm delete
    const confirmBtn = screen.getByTestId("confirmation-modal-confirm");
    await user.click(confirmBtn);

    // Assert DELETE fetch called and note removed
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/staff/notes/1"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
      expect(
        screen.queryByText("Revisar logs del servidor"),
      ).not.toBeInTheDocument();
    });
  });

  it("cancels create modal when cancel button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(<StaffNotes />);
    await waitFor(() =>
      expect(screen.getByText("Notas Rápidas")).toBeInTheDocument(),
    );

    // Act: open modal
    await user.click(screen.getByRole("button", { name: /nueva nota/i }));
    expect(
      screen.getByRole("textbox", { name: "Contenido de la nota" }),
    ).toBeInTheDocument();

    // Act: click cancel
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    // Assert modal is closed
    expect(
      screen.queryByRole("textbox", { name: "Contenido de la nota" }),
    ).not.toBeInTheDocument();
  });
});
