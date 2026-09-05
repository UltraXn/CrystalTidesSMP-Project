import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import SkinViewer from "@/components/User/SkinViewer";
import { renderWithProviders } from "@/utils/test-utils";

interface MockViewer {
  animation: unknown;
  controls: { enableZoom: boolean };
  autoRotate: boolean;
  autoRotateSpeed: number;
}

vi.mock("react-skinview3d", () => ({
  ReactSkinview3d: ({
    skinUrl,
    width,
    height,
    onReady,
  }: {
    skinUrl: string;
    width: number;
    height: number;
    onReady?: (args: { viewer: MockViewer }) => void;
  }) => {
    const mockViewer: MockViewer = {
      animation: null,
      controls: { enableZoom: true },
      autoRotate: false,
      autoRotateSpeed: 0,
    };
    if (onReady) {
      onReady({ viewer: mockViewer });
    }
    return (
      <canvas
        data-testid="mock-skinview3d"
        data-skin-url={skinUrl}
        width={width}
        height={height}
      />
    );
  },
}));

describe("User/SkinViewer", () => {
  it("renders skin viewer with username URL and custom dimensions", () => {
    const { container } = renderWithProviders(
      <SkinViewer username="Notch" width={320} height={420} animation="walk" />
    );

    const wrapper = container.querySelector(".skin-viewer-container");
    expect(wrapper).toBeInTheDocument();

    const canvas = screen.getByTestId("mock-skinview3d");
    expect(canvas).toHaveAttribute(
      "data-skin-url",
      "https://mc-heads.net/skin/Notch"
    );
    expect(canvas).toHaveAttribute("width", "320");
    expect(canvas).toHaveAttribute("height", "420");
  });

  it("renders default dimensions and idle animation when optional props omitted", () => {
    renderWithProviders(<SkinViewer username="Alex" />);

    const canvas = screen.getByTestId("mock-skinview3d");
    expect(canvas).toHaveAttribute(
      "data-skin-url",
      "https://mc-heads.net/skin/Alex"
    );
    expect(canvas).toHaveAttribute("width", "300");
    expect(canvas).toHaveAttribute("height", "400");
  });
});
