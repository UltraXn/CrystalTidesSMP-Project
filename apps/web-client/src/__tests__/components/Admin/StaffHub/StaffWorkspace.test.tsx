import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import StaffWorkspace from "@/components/Admin/StaffHub/StaffWorkspace";

vi.mock("@/components/Admin/StaffHub/KanbanBoard", () => ({
  default: () => <div data-testid="kanban-board">Kanban Board Mock</div>,
}));

vi.mock("@/components/Admin/StaffHub/StaffNotes", () => ({
  default: () => <div data-testid="staff-notes">Staff Notes Mock</div>,
}));

describe("StaffWorkspace", () => {
  it("renders both KanbanBoard and StaffNotes in workspace layout", () => {
    // Arrange & Act
    renderWithProviders(<StaffWorkspace />);

    // Assert
    expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    expect(screen.getByTestId("staff-notes")).toBeInTheDocument();
  });
});
