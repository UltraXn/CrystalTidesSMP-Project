import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { CrystalCard } from "@/components/Launcher/CrystalCard";
import { renderWithProviders } from "@/utils/test-utils";

describe("Launcher/CrystalCard", () => {
  it("renders children content with default glass styling and hover effect", () => {
    const { container } = renderWithProviders(
      <CrystalCard>
        <p>Card Body Content</p>
      </CrystalCard>
    );

    expect(screen.getByText("Card Body Content")).toBeInTheDocument();
    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl).toHaveClass("glass-card");
    expect(cardEl).toHaveClass("glass-card-hover");
  });

  it("omits hover class when enableHoverEffect is false", () => {
    const { container } = renderWithProviders(
      <CrystalCard enableHoverEffect={false} className="custom-class">
        <span>Static Card</span>
      </CrystalCard>
    );

    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl).toHaveClass("glass-card");
    expect(cardEl).not.toHaveClass("glass-card-hover");
    expect(cardEl).toHaveClass("custom-class");
  });
});
