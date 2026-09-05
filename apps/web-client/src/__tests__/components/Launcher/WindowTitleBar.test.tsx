import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowTitleBar } from "@/components/Launcher/WindowTitleBar";
import { renderWithProviders } from "@/utils/test-utils";

const mockMinimize = vi.fn();
const mockClose = vi.fn();
const mockStartDragging = vi.fn().mockResolvedValue(undefined);

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    minimize: mockMinimize,
    close: mockClose,
    startDragging: mockStartDragging,
  }),
}));

describe("Launcher/WindowTitleBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the launcher logo and title text", () => {
    renderWithProviders(<WindowTitleBar />);

    expect(screen.getByText("CrystalTides Launcher")).toBeInTheDocument();
    const logo = screen.getByAltText("CrystalTides Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.png");
  });

  it("triggers minimize when minimize button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WindowTitleBar />);

    const minBtn = screen.getByRole("button", { name: "Minimizar ventana" });
    expect(minBtn).toBeInTheDocument();
    await user.click(minBtn);
    expect(mockMinimize).toHaveBeenCalledTimes(1);
  });

  it("triggers close when close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WindowTitleBar />);

    const closeBtn = screen.getByRole("button", { name: "Cerrar ventana" });
    expect(closeBtn).toBeInTheDocument();
    await user.click(closeBtn);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("initiates window dragging on mouse down with left button", () => {
    const { container } = renderWithProviders(<WindowTitleBar />);
    const dragRegion = container.querySelector(".titlebar-drag-region");
    expect(dragRegion).toBeInTheDocument();

    if (dragRegion) {
      fireEvent.mouseDown(dragRegion, { button: 0 });
      expect(mockStartDragging).toHaveBeenCalledTimes(1);
    }
  });

  it("does not initiate window dragging with non-left mouse button", () => {
    const { container } = renderWithProviders(<WindowTitleBar />);
    const dragRegion = container.querySelector(".titlebar-drag-region");

    if (dragRegion) {
      fireEvent.mouseDown(dragRegion, { button: 2 });
      expect(mockStartDragging).not.toHaveBeenCalled();
    }
  });
});
