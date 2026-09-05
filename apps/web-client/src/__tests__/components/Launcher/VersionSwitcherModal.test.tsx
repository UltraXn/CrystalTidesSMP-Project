import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import { VersionSwitcherModal } from "@/components/Launcher/VersionSwitcherModal";

describe("VersionSwitcherModal Component", () => {
  it("renders modal dialog with title, search bar, and loader filter pills", () => {
    renderWithProviders(
      <VersionSwitcherModal onSelectVersion={vi.fn()} onClose={vi.fn()} />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Elige tu versión de juego/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Buscar versión por número o nombre/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Todos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FABRIC" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FORGE" })).toBeInTheDocument();
  });

  it("calls onClose when 'Volver al Inicio' button is clicked", async () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <VersionSwitcherModal onSelectVersion={vi.fn()} onClose={handleClose} />
    );

    const closeButton = screen.getByRole("button", { name: /Volver al inicio/i });
    await userEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("filters versions by search query", async () => {
    renderWithProviders(
      <VersionSwitcherModal onSelectVersion={vi.fn()} onClose={vi.fn()} />
    );

    const searchInput = screen.getByLabelText(/Buscar versión por número o nombre/i);
    await userEvent.type(searchInput, "Nether");

    expect(screen.getByText(/Nether Update/i)).toBeInTheDocument();
    expect(screen.queryByText(/Trails & Tales/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Legacy PvP \/ Bedwars/i)).not.toBeInTheDocument();
  });

  it("filters versions by mod loader pill", async () => {
    renderWithProviders(
      <VersionSwitcherModal onSelectVersion={vi.fn()} onClose={vi.fn()} />
    );

    const forgePill = screen.getByRole("button", { name: "FORGE" });
    await userEvent.click(forgePill);

    expect(screen.getByText(/Nether Update/i)).toBeInTheDocument();
    expect(screen.getByText(/Legacy PvP \/ Bedwars/i)).toBeInTheDocument();
    expect(screen.queryByText(/Trails & Tales/i)).not.toBeInTheDocument();
  });

  it("updates selected subversion when dropdown changes", () => {
    renderWithProviders(
      <VersionSwitcherModal onSelectVersion={vi.fn()} onClose={vi.fn()} />
    );

    const selects = screen.getAllByLabelText(/Seleccionar subversión/i);
    expect(selects.length).toBeGreaterThan(0);

    // Target the first one (Future Snapshot / 26.1)
    const firstSelect = selects[0];
    fireEvent.change(firstSelect, { target: { value: "26.1.0-snap" } });

    expect(firstSelect).toHaveValue("26.1.0-snap");
    expect(
      screen.getByRole("button", { name: /Jugar versión 26.1.0-snap con Fabric/i })
    ).toBeInTheDocument();
  });

  it("calls onSelectVersion and onClose when a play button is clicked", async () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    renderWithProviders(
      <VersionSwitcherModal onSelectVersion={handleSelect} onClose={handleClose} />
    );

    // Click play for the default 1.21 CrystalTides Oficial (selectedSub 1.21.3)
    const playButton = screen.getByRole("button", {
      name: /Jugar versión 1.21.3 con Fabric/i,
    });
    await userEvent.click(playButton);

    expect(handleSelect).toHaveBeenCalledWith("1.21.3", "Fabric");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
