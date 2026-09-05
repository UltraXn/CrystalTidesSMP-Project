import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { SocialPanel } from "@/components/Launcher/SocialPanel";

describe("SocialPanel Component", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("does not render anything when isOpen is false", () => {
    const { container } = renderWithProviders(
      <SocialPanel isOpen={false} onClose={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders panel header, tabs, and friends list when isOpen is true", () => {
    renderWithProviders(<SocialPanel isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByLabelText(/Panel Social de CrystalTides/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Amigos/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Solicitudes/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("172px")).toBeInTheDocument();
    expect(screen.getByText("daaaavidds")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const handleClose = vi.fn();
    renderWithProviders(<SocialPanel isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText("Cerrar panel social");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("switches tabs between friends and requests", () => {
    renderWithProviders(<SocialPanel isOpen={true} onClose={vi.fn()} />);

    const requestsTab = screen.getByRole("tab", { name: /Solicitudes/i });
    fireEvent.click(requestsTab);

    expect(requestsTab).toHaveAttribute("aria-selected", "true");
  });

  it("filters friends according to the search query", () => {
    renderWithProviders(<SocialPanel isOpen={true} onClose={vi.fn()} />);

    const searchInput = screen.getByLabelText(
      /Buscar un jugador en la lista de amigos/i,
    );
    fireEvent.change(searchInput, { target: { value: "daaaavidds" } });

    expect(screen.getByText("daaaavidds")).toBeInTheDocument();
    expect(screen.queryByText("masaya46")).not.toBeInTheDocument();
  });

  it("opens active chat overlay when a friend is selected and sends a message", () => {
    renderWithProviders(<SocialPanel isOpen={true} onClose={vi.fn()} />);

    // Click on friend 172px
    const friendRow = screen.getByText("172px");
    fireEvent.click(friendRow);

    // Chat overlay should be visible
    const chatInput = screen.getByLabelText(/Escribir mensaje para 172px/i);
    expect(chatInput).toBeInTheDocument();

    // Type a message and submit
    fireEvent.change(chatInput, {
      target: { value: "Hola bro! Vamos a jugar" },
    });
    const sendBtn = screen.getByLabelText("Enviar mensaje");
    fireEvent.click(sendBtn);

    expect(screen.getByText("Hola bro! Vamos a jugar")).toBeInTheDocument();

    // Fast-forward 1200ms for simulated reply
    act(() => {
      vi.advanceTimersByTime(1250);
    });

    expect(
      screen.getByText("¡Perfecto! Nos vemos adentro."),
    ).toBeInTheDocument();
  });
});
