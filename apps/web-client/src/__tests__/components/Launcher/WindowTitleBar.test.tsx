import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowTitleBar } from "@/components/Launcher/WindowTitleBar";
import { renderWithProviders } from "@/utils/test-utils";

const mockMinimize = vi.fn();
const mockClose = vi.fn();

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    minimize: mockMinimize,
    close: mockClose,
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

  // Dragging is native: Tauri moves the window from elements marked data-tauri-drag-region,
  // so no JS mousedown handler (startDragging) is involved anymore.
  it("marks the title area as a native Tauri drag region", () => {
    const { container } = renderWithProviders(<WindowTitleBar />);
    const dragRegion = container.querySelector(".titlebar-drag-region");

    expect(dragRegion).toBeInTheDocument();
    expect(dragRegion).toHaveAttribute("data-tauri-drag-region");
  });
});
