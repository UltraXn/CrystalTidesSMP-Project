import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "@testing-library/react";
import HalloweenPop from "@/components/Effects/HalloweenPop";
import { renderWithProviders } from "@/utils/test-utils";

describe("HalloweenPop", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders halloween pop container and spawns pumpkins periodically", () => {
    renderWithProviders(<HalloweenPop />);

    const container = document.body.querySelector(".halloween-pop-container");
    expect(container).toBeInTheDocument();

    expect(document.body.querySelectorAll(".pumpkin-pop").length).toBe(0);

    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(document.body.querySelectorAll(".pumpkin-pop").length).toBe(1);

    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(document.body.querySelectorAll(".pumpkin-pop").length).toBe(2);
  });
});
