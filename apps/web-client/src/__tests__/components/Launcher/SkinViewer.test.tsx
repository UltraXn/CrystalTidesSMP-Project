import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/utils/test-utils";
import { SkinViewer } from "@/components/Launcher/SkinViewer";

const mockConstructor = vi.fn();
const mockLoadCape = vi.fn();
const mockDispose = vi.fn();

vi.mock("skinview3d", () => {
  class MockSkinViewer {
    globalLight = { intensity: 0 };
    cameraLight = { intensity: 0 };
    animation = null;
    autoRotate = false;
    autoRotateSpeed = 0;
    camera = { position: { set: vi.fn() } };
    zoom = 1;
    controls = { enableZoom: true };
    loadCape = mockLoadCape;
    dispose = mockDispose;
    width = 0;
    height = 0;

    constructor(options: unknown) {
      mockConstructor(options);
    }
  }

  class MockIdleAnimation {
    speed = 0;
  }

  return {
    SkinViewer: MockSkinViewer,
    IdleAnimation: MockIdleAnimation,
  };
});

describe("Launcher/SkinViewer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a canvas element", () => {
    const { container } = renderWithProviders(<SkinViewer username="Player1" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("initializes SkinViewer with skin URL based on username", () => {
    renderWithProviders(<SkinViewer username="Notch" />);

    expect(mockConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        skin: "https://mc-heads.net/skin/Notch",
      })
    );
  });

  it("uses uuid for skin URL when a valid uuid is provided", () => {
    const validUuid = "12345678-1234-1234-1234-123456789abc";
    renderWithProviders(<SkinViewer username="Notch" uuid={validUuid} />);

    expect(mockConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        skin: `https://mc-heads.net/skin/${validUuid}`,
      })
    );
  });

  it("disposes the skin viewer instance on unmount", () => {
    const { unmount } = renderWithProviders(<SkinViewer username="Player1" />);
    unmount();

    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});
