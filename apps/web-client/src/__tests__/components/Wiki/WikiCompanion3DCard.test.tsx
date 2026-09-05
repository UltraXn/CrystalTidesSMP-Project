import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import WikiCompanion3DCard from "@/components/Wiki/WikiCompanion3DCard";

vi.mock("three", () => ({
  Scene: class {
    add = vi.fn();
    remove = vi.fn();
  },
  PerspectiveCamera: class {
    position = { set: vi.fn() };
    lookAt = vi.fn();
    aspect = 1;
    updateProjectionMatrix = vi.fn();
  },
  WebGLRenderer: class {
    domElement = document.createElement("canvas");
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    shadowMap = { enabled: false, type: 0 };
    outputColorSpace = "srgb";
  },
  AmbientLight: class {},
  DirectionalLight: class {
    position = { set: vi.fn() };
  },
  PointLight: class {
    position = { set: vi.fn() };
  },
  OctahedronGeometry: class {},
  MeshStandardMaterial: class {},
  Group: class {
    add = vi.fn();
    clear = vi.fn();
    scale = { setScalar: vi.fn() };
    rotation = { x: 0, y: 0 };
  },
  Mesh: class {
    position = { set: vi.fn(), sub: vi.fn(), x: 0, y: 0, z: 0 };
    rotation = { set: vi.fn(), x: 0, y: 0 };
    traverse = vi.fn();
  },
  Clock: class {
    getDelta = vi.fn().mockReturnValue(0.016);
  },
  AnimationMixer: class {
    update = vi.fn();
    clipAction = vi.fn().mockReturnValue({
      play: vi.fn(),
      reset: vi.fn(),
      fadeIn: vi.fn().mockReturnThis(),
    });
  },
  Box3: class {
    min = { x: 0, y: 0, z: 0 };
    max = { x: 1, y: 1, z: 1 };
    setFromObject = vi.fn().mockReturnThis();
    getSize = vi.fn().mockReturnValue({ x: 1, y: 1, z: 1 });
    getCenter = vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 });
  },
  Vector3: class {
    sub = vi.fn();
    multiplyScalar = vi.fn();
  },
  SRGBColorSpace: "srgb",
  PCFSoftShadowMap: 2,
}));

vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: class {
    load = vi.fn().mockImplementation((_url, onLoad) => {
      onLoad({
        scene: {
          traverse: vi.fn(),
          position: { set: vi.fn(), sub: vi.fn(), x: 0, y: 0, z: 0 },
          rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
          scale: { setScalar: vi.fn(), set: vi.fn() },
        },
        animations: [{ name: "idle" }],
      });
    });
  },
}));

describe("WikiCompanion3DCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3D viewport, companion name, subtitle, and description", () => {
    renderWithProviders(
      <WikiCompanion3DCard
        bossName="Red Panda"
        subtitle="Fauna Domésticable"
        hp="20 HP (10 Corazones)"
        speed="0.30 (Pasivo)"
        location="Bosques Templados & Selvas"
        description="Criatura dócil y juguetona que puede ser domesticada como mascota fiel."
        tamingItems={["Bamboo", "Sweet Berries"]}
        drops={["Bamboo", "Cuero Suave"]}
      />,
    );

    expect(
      screen.getByRole("region", { name: /Visualizador 3D Mascota/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Red Panda/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Fauna Domésticable/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Criatura dócil y juguetona/),
    ).toBeInTheDocument();
    expect(screen.getByText("Bamboo, Sweet Berries")).toBeInTheDocument();
    expect(screen.getByText("20 HP (10 Corazones)")).toBeInTheDocument();
    expect(screen.getByText("0.30 (Pasivo)")).toBeInTheDocument();
    expect(
      screen.getByText(/Bosques Templados & Selvas/),
    ).toBeInTheDocument();
    expect(screen.getByText("🐾 Bamboo")).toBeInTheDocument();
    expect(screen.getByText("🐾 Cuero Suave")).toBeInTheDocument();
  });

  it("renders correctly in minimal3dOnly mode", () => {
    renderWithProviders(
      <WikiCompanion3DCard minimal3dOnly bossName="Red Panda" />,
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: /Red Panda/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Visualizador 3D Mascota/i }),
    ).not.toBeInTheDocument();
  });

  it("handles camera reset and fullscreen controls", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiCompanion3DCard bossName="Red Panda" />);

    const resetBtn = screen.getByRole("button", {
      name: /Reiniciar cámara/i,
    });
    await user.click(resetBtn);
    expect(resetBtn).toBeInTheDocument();

    const fullscreenBtn = screen.getByRole("button", {
      name: /Pantalla completa/i,
    });
    await user.click(fullscreenBtn);
    expect(fullscreenBtn).toBeInTheDocument();
  });

  it("handles mouse drag interactions on 3D viewport", () => {
    renderWithProviders(<WikiCompanion3DCard bossName="Red Panda" />);

    const viewport = screen.getByRole("region", {
      name: /Visualizador 3D Mascota/i,
    });
    fireEvent.mouseDown(viewport, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(viewport, { clientX: 150, clientY: 120 });
    fireEvent.mouseUp(viewport);
  });
});
