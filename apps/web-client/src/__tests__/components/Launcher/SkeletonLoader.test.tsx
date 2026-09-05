import { describe, it, expect } from "vitest";
import { SkeletonLoader } from "@/components/Launcher/SkeletonLoader";
import { renderWithProviders } from "@/utils/test-utils";

describe("Launcher/SkeletonLoader", () => {
  it("renders with default skeleton class and dimensions", () => {
    const { container } = renderWithProviders(<SkeletonLoader />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("skeleton");
    expect(el).toHaveStyle({ width: "100%", height: "1rem" });
  });

  it("applies custom width, height, and border radius", () => {
    const { container } = renderWithProviders(
      <SkeletonLoader width={120} height="40px" borderRadius="8px" />
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({
      width: "120px",
      height: "40px",
      borderRadius: "8px",
    });
  });

  it("combines custom className with skeleton base class", () => {
    const { container } = renderWithProviders(
      <SkeletonLoader className="animate-pulse shadow-sm" />
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("skeleton");
    expect(el).toHaveClass("animate-pulse");
    expect(el).toHaveClass("shadow-sm");
  });
});
