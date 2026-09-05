import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { RoleBadge } from "@/components/Launcher/RoleBadge";
import { renderWithProviders } from "@/utils/test-utils";

describe("Launcher/RoleBadge", () => {
  it("renders default user badge when role is not provided", () => {
    renderWithProviders(<RoleBadge />);
    const badge = screen.getByRole("img");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("src", "/ranks/user.png");
    expect(badge).toHaveAttribute("alt", "Usuario");
    expect(badge).toHaveAttribute("title", "Rango: Usuario");
  });

  it("renders correct badge path and title for admin role", () => {
    renderWithProviders(<RoleBadge role="admin" size="lg" />);
    const badge = screen.getByRole("img");
    expect(badge).toHaveAttribute("src", "/ranks/admin.png");
    expect(badge).toHaveAttribute("alt", "Admin");
    expect(badge).toHaveAttribute("title", "Rango: Admin");
    expect(badge).toHaveStyle({ height: "22px" });
  });

  it("applies size height mappings correctly", () => {
    const { rerender } = renderWithProviders(<RoleBadge role="mod" size="sm" />);
    let badge = screen.getByRole("img");
    expect(badge).toHaveStyle({ height: "13px" });

    rerender(<RoleBadge role="mod" size="md" />);
    badge = screen.getByRole("img");
    expect(badge).toHaveStyle({ height: "16px" });
  });

  it("falls back to /ranks/user.png on image load error", () => {
    renderWithProviders(<RoleBadge role="unknown_special_rank" />);
    const badge = screen.getByRole("img");

    fireEvent.error(badge);
    expect(badge).toHaveAttribute("src", "/ranks/user.png");
  });

  it("applies custom styles when provided", () => {
    renderWithProviders(
      <RoleBadge role="developer" style={{ opacity: 0.8, margin: "4px" }} />
    );
    const badge = screen.getByRole("img");
    expect(badge).toHaveStyle({ opacity: "0.8", margin: "4px" });
  });
});
