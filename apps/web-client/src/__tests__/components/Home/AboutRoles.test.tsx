import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AboutRoles from "@/components/Home/AboutRoles";
import { renderWithProviders } from "@/utils/test-utils";

vi.mock("@/components/Home/AboutRolesRadar", () => ({
  default: () => <div data-testid="mock-about-roles-radar" />,
}));

describe("AboutRoles", () => {
  it("renders role selection and prestige tiers", () => {
    renderWithProviders(<AboutRoles />);

    expect(screen.getByText(/Elige tu Camino/i)).toBeInTheDocument();

    expect(
      screen.getAllByText(/Constructor & Colonizador/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Luchador & Gladiador/i).length).toBeGreaterThan(
      0,
    );
  });

  it("switches active role when another role card is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AboutRoles />);

    const luchadorBtn = screen.getByText(/Luchador & Gladiador/i);
    await user.click(luchadorBtn);

    expect(screen.getByText(/PvP, Mobs y Mazmorras/i)).toBeInTheDocument();
  });
});
