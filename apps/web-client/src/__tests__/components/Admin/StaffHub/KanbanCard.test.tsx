import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import KanbanCard from "@/components/Admin/StaffHub/KanbanCard";
import { KanbanTask } from "@crystaltides/shared";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("KanbanCard", () => {
  const sampleTask: KanbanTask = {
    id: 1,
    title: "Fix Spawn Glitch",
    columnId: "todo",
    priority: "High",
    type: "Bug",
    assignee: "SteveBuilder",
    due_date: "2026-03-05T14:30:00Z",
    created_at: "2026-03-01T00:00:00Z",
  };

  it("renders task title, priority badge, type, and assignee", () => {
    // Arrange & Act
    renderWithProviders(
      <KanbanCard
        card={sampleTask}
        onDragStart={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("Fix Spawn Glitch")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(screen.getByText("SteveBuilder")).toBeInTheDocument();
    expect(screen.getByAltText("SteveBuilder")).toBeInTheDocument();
  });

  it("renders unassigned placeholder when assignee is missing or Unassigned", () => {
    // Arrange
    const unassignedTask: KanbanTask = {
      ...sampleTask,
      id: 2,
      assignee: "Unassigned",
    };

    // Act
    renderWithProviders(
      <KanbanCard card={unassignedTask} onDragStart={vi.fn()} />,
    );

    // Assert
    expect(screen.getByText("Sin asignar")).toBeInTheDocument();
  });

  it("renders backlog date badge when columnId is idea", () => {
    // Arrange
    const ideaTask: KanbanTask = {
      ...sampleTask,
      id: 3,
      columnId: "idea",
    };

    // Act
    renderWithProviders(<KanbanCard card={ideaTask} onDragStart={vi.fn()} />);

    // Assert
    expect(screen.getByText("Por confirmar")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onEdit = vi.fn();

    renderWithProviders(
      <KanbanCard
        card={sampleTask}
        onDragStart={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    // Act
    const editBtn = screen.getByRole("button", {
      name: /editar tarea: fix spawn glitch/i,
    });
    await user.click(editBtn);

    // Assert
    expect(onEdit).toHaveBeenCalledWith(sampleTask);
  });

  it("calls onDelete when delete button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onDelete = vi.fn();

    renderWithProviders(
      <KanbanCard
        card={sampleTask}
        onDragStart={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    // Act
    const deleteBtn = screen.getByRole("button", {
      name: /eliminar tarea: fix spawn glitch/i,
    });
    await user.click(deleteBtn);

    // Assert
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("calls onDragStart when card is dragged", () => {
    // Arrange
    const onDragStart = vi.fn();
    const { container } = renderWithProviders(
      <KanbanCard card={sampleTask} onDragStart={onDragStart} />,
    );

    const cardElement = container.querySelector(".kanban-card-premium");
    expect(cardElement).toBeInTheDocument();

    // Act
    if (cardElement) {
      fireEvent.dragStart(cardElement);
    }

    // Assert
    expect(onDragStart).toHaveBeenCalledWith(expect.anything(), 1);
  });
});
