import { describe, it, expect } from "vitest";
import { renderWithProviders } from "@/utils/test-utils";
import { AmbientBubbles } from "@/components/Launcher/AmbientBubbles";

describe("AmbientBubbles Component", () => {
  it("renders container with 22 animated ambient bubble elements", () => {
    const { container } = renderWithProviders(<AmbientBubbles />);

    const bubbleContainer = container.querySelector(".ambient-bubbles-container");
    expect(bubbleContainer).toBeInTheDocument();

    const bubbles = container.querySelectorAll(".ambient-bubble");
    expect(bubbles.length).toBe(22);
  });

  it("applies dynamic styles (width, height, left, duration, delay) to bubbles", () => {
    const { container } = renderWithProviders(<AmbientBubbles />);

    const bubbles = container.querySelectorAll(".ambient-bubble");
    const firstBubble = bubbles[0] as HTMLElement;

    expect(firstBubble.style.width).toMatch(/\d+(\.\d+)?px/);
    expect(firstBubble.style.height).toMatch(/\d+(\.\d+)?px/);
    expect(firstBubble.style.left).toMatch(/\d+(\.\d+)?vw/);
    expect(firstBubble.style.animationDuration).toMatch(/\d+(\.\d+)?s/);
    expect(firstBubble.style.animationDelay).toMatch(/\d+(\.\d+)?s/);
  });
});
