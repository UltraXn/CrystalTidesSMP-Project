import { describe, it, expect } from "vitest";
import AmbientBubbles from "@/components/Effects/AmbientBubbles";
import { renderWithProviders } from "@/utils/test-utils";

describe("AmbientBubbles", () => {
  it("renders portal container with ambient bubble elements in document body", () => {
    renderWithProviders(<AmbientBubbles />);

    const container = document.body.querySelector(".ambient-bubbles-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("aria-hidden", "true");

    const bubbles = document.body.querySelectorAll(".ambient-bubble");
    expect(bubbles.length).toBe(20);
  });
});
