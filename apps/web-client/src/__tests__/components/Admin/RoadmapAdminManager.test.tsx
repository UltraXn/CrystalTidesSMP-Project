import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoadmapAdminManager from "@/components/Admin/RoadmapAdminManager";
import { renderWithProviders } from "@/utils/test-utils";

// Mock @tanstack/react-query useQuery
const { mockDays } = vi.hoisted(() => ({
  mockDays: [
    { day: 1, title: "Día de Bienvenida", reward_type: "killucoins", reward_value: 50, multiplier: 1 },
    { day: 2, title: "Tirada de Suerte", reward_type: "gacha_spin", reward_value: 1, multiplier: 1 },
    { day: 30, title: "Logro Legendario", reward_type: "achievement", reward_value: 1, multiplier: 50, is_jackpot: true },
  ],
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>;
  return {
    ...original,
    useQuery: vi.fn().mockReturnValue({
      data: mockDays,
      isLoading: false,
    }),
  };
});

// Mock adminAuth
vi.mock("@/services/adminAuth", () => ({
  getAdminToken: vi.fn().mockReturnValue("mock-admin-token"),
}));

describe("Admin/RoadmapAdminManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global fetch mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("renders the heading with roadmap title", () => {
    renderWithProviders(<RoadmapAdminManager />);

    expect(screen.getByText(/Gestor de Recompensas y Roadmap Mensual/)).toBeInTheDocument();
  });

  it("renders the save button", () => {
    renderWithProviders(<RoadmapAdminManager />);

    expect(screen.getByRole("button", { name: /Guardar configuración del roadmap/i })).toBeInTheDocument();
  });

  it("renders all 3 mock day cards with day labels", () => {
    renderWithProviders(<RoadmapAdminManager />);

    expect(screen.getByText("Día 1")).toBeInTheDocument();
    expect(screen.getByText("Día 2")).toBeInTheDocument();
    expect(screen.getByText("Día 30")).toBeInTheDocument();
  });

  it("renders JACKPOT badge on day 30", () => {
    renderWithProviders(<RoadmapAdminManager />);

    expect(screen.getByText("JACKPOT X50")).toBeInTheDocument();
  });

  it("renders title inputs with correct values", () => {
    renderWithProviders(<RoadmapAdminManager />);

    const titleInput1 = screen.getByLabelText("Título", { selector: "#roadmap-day-1-title" });
    expect(titleInput1).toHaveValue("Día de Bienvenida");

    const titleInput30 = screen.getByLabelText("Título", { selector: "#roadmap-day-30-title" });
    expect(titleInput30).toHaveValue("Logro Legendario");
  });

  it("allows editing a day title input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoadmapAdminManager />);

    const titleInput = screen.getByLabelText("Título", { selector: "#roadmap-day-1-title" });
    await user.clear(titleInput);
    await user.type(titleInput, "Nuevo Título");

    expect(titleInput).toHaveValue("Nuevo Título");
  });

  it("shows success message after saving", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoadmapAdminManager />);

    const saveBtn = screen.getByRole("button", { name: /Guardar configuración del roadmap/i });
    await user.click(saveBtn);

    // Wait for the status message to appear
    const statusMsg = await screen.findByRole("status");
    expect(statusMsg).toHaveTextContent("✅ Configuración de Roadmap actualizada correctamente.");
  });

  it("shows error message when save fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const user = userEvent.setup();
    renderWithProviders(<RoadmapAdminManager />);

    const saveBtn = screen.getByRole("button", { name: /Guardar configuración del roadmap/i });
    await user.click(saveBtn);

    const statusMsg = await screen.findByRole("status");
    expect(statusMsg).toHaveTextContent("❌ Error guardando configuración.");
  });
});
