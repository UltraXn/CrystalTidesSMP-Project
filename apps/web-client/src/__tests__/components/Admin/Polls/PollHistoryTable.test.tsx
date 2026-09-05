import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import PollHistoryTable from "@/components/Admin/Polls/PollHistoryTable";
import { Poll } from "@/components/Admin/Polls/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
      if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
      if (typeof fallbackOrOptions === "object" && fallbackOrOptions !== null) {
        if ("page" in fallbackOrOptions) {
          return `Página ${fallbackOrOptions.page} de ${fallbackOrOptions.total}`;
        }
        if ("count" in fallbackOrOptions) {
          return `${key} (${fallbackOrOptions.count})`;
        }
      }
      return key;
    },
  }),
}));

describe("PollHistoryTable", () => {
  const samplePolls: Poll[] = [
    {
      id: 1,
      title: "Encuesta Activa 1",
      question: "¿Pregunta 1?",
      options: [],
      totalVotes: 85,
      created_at: "2026-03-01T00:00:00Z",
      is_active: true,
    },
    {
      id: 2,
      title: "Encuesta Cerrada 2",
      question: "¿Pregunta 2?",
      options: [],
      totalVotes: 120,
      created_at: "2026-02-15T00:00:00Z",
      is_active: false,
    },
  ];

  it("renders loader when loading is true", () => {
    // Arrange & Act
    renderWithProviders(
      <PollHistoryTable
        polls={[]}
        loading={true}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByAltText("Crystal Tides")).toBeInTheDocument();
  });

  it("renders empty table row when polls list is empty", () => {
    // Arrange & Act
    renderWithProviders(
      <PollHistoryTable
        polls={[]}
        loading={false}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("admin.polls.no_history")).toBeInTheDocument();
  });

  it("renders table rows with poll details, status chips, and vote count", () => {
    // Arrange & Act
    renderWithProviders(
      <PollHistoryTable
        polls={samplePolls}
        loading={false}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("Encuesta Activa 1")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(
      screen.getByText("admin.polls.status_chip.active"),
    ).toBeInTheDocument();

    expect(screen.getByText("Encuesta Cerrada 2")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(
      screen.getByText("admin.polls.status_chip.closed"),
    ).toBeInTheDocument();
  });

  it("calls onClose when close poll action button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <PollHistoryTable
        polls={samplePolls}
        loading={false}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
        onDelete={vi.fn()}
        onClose={onClose}
      />,
    );

    // Act: click close on active poll
    const closeBtn = screen.getByLabelText(
      /finalizar encuesta encuesta activa 1/i,
    );
    await user.click(closeBtn);

    // Assert
    expect(onClose).toHaveBeenCalledWith(1);
  });

  it("calls onDelete when delete poll action button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onDelete = vi.fn();

    renderWithProviders(
      <PollHistoryTable
        polls={samplePolls}
        loading={false}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
        onDelete={onDelete}
        onClose={vi.fn()}
      />,
    );

    // Act: click delete on closed poll
    const deleteBtn = screen.getByLabelText(
      /eliminar encuesta encuesta cerrada 2/i,
    );
    await user.click(deleteBtn);

    // Assert
    expect(onDelete).toHaveBeenCalledWith(2);
  });

  it("renders pagination controls and triggers onPageChange when totalPages > 1", async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    renderWithProviders(
      <PollHistoryTable
        polls={samplePolls}
        loading={false}
        page={1}
        totalPages={3}
        onPageChange={onPageChange}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Assert
    const prevBtn = screen.getByLabelText("Página anterior");
    const nextBtn = screen.getByLabelText("Página siguiente");
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Act
    await user.click(nextBtn);

    // Assert
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
