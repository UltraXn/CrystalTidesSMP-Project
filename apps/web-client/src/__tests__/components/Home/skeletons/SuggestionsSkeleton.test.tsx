import { describe, it, expect } from "vitest";
import { renderWithProviders } from "@/utils/test-utils";
import SuggestionsSkeleton from "@/components/Home/skeletons/SuggestionsSkeleton";

describe("SuggestionsSkeleton", () => {
  it("renders skeleton pulse container and bone placeholders", () => {
    const { container } = renderWithProviders(<SuggestionsSkeleton />);

    const pulseWrapper = container.querySelector(".animate-pulse");
    expect(pulseWrapper).toBeInTheDocument();

    const bones = container.querySelectorAll(".bg-white\\/8");
    expect(bones.length).toBeGreaterThanOrEqual(10);
  });
});
