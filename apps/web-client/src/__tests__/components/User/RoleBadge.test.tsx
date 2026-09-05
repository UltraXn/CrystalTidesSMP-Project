import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import RoleBadge from "@/components/User/RoleBadge";
import { renderWithProviders } from "@/utils/test-utils";

describe("RoleBadge", () => {
  it("renders null when neither role nor username is provided", () => {
    const { container } = renderWithProviders(<RoleBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders special owner rank image for specific usernames", () => {
    const { rerender } = renderWithProviders(<RoleBadge username="KilluaZoldyck" />);
    const killuImg = screen.getByRole("img", { name: "KILLU" });
    expect(killuImg).toHaveAttribute("src", "/ranks/rank-killu.png");

    rerender(<RoleBadge username="UltraXn" />);
    const neroImg = screen.getByRole("img", { name: "NEROFERNO" });
    expect(neroImg).toHaveAttribute("src", "/ranks/rank-neroferno.png");
  });

  it("renders role badges based on role name", () => {
    const { rerender } = renderWithProviders(<RoleBadge role="admin" username="randomPlayer" />);
    expect(screen.getByRole("img", { name: "ADMIN" })).toHaveAttribute("src", "/ranks/admin.png");

    rerender(<RoleBadge role="developer" username="randomPlayer" />);
    expect(screen.getByRole("img", { name: "DEVELOPER" })).toHaveAttribute("src", "/ranks/developer.png");

    rerender(<RoleBadge role="staff" username="randomPlayer" />);
    expect(screen.getByRole("img", { name: "STAFF" })).toHaveAttribute("src", "/ranks/staff.png");
  });

  it("renders default user badge for regular user role", () => {
    renderWithProviders(<RoleBadge role="user" username="regularGuy" />);
    expect(screen.getByRole("img", { name: "USUARIO" })).toHaveAttribute("src", "/ranks/user.png");
  });
});
