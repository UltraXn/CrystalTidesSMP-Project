import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import WikiHostile3DCard from "@/components/Wiki/WikiHostile3DCard";

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

describe("WikiHostile3DCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3D viewport, creature name, subtitle, stats, and rewards", () => {
    renderWithProviders(
      <WikiHostile3DCard
        bossName="Chupacabra"
        subtitle="Criatura Hostil Mitológica"
        hp="40 HP (20 Corazones)"
        damage="8 HP (Daño Físico)"
        speed="0.35 (Marcha Agresiva)"
        location="Bosques Nocturnos & Cavernas"
        spawnMethod="Generación Natural Nocturna"
        description="Depredador nocturno sediento de sangre con mandíbulas retráctiles."
        drops={["Piel Mítica", "Diente Infectado"]}
        kcReward={150}
      />,
    );

    expect(
      screen.getByRole("region", { name: /Visualizador 3D Hostil/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Chupacabra/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Criatura Hostil Mitológica/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Depredador nocturno sediento de sangre/),
    ).toBeInTheDocument();
    expect(screen.getByText("40 HP (20 Corazones)")).toBeInTheDocument();
    expect(screen.getByText("8 HP (Daño Físico)")).toBeInTheDocument();
    expect(screen.getByText("0.35 (Marcha Agresiva)")).toBeInTheDocument();
    expect(
      screen.getByText(/Bosques Nocturnos & Cavernas/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Generación Natural Nocturna/),
    ).toBeInTheDocument();
    expect(screen.getByText("+150 KC")).toBeInTheDocument();
    expect(screen.getByText("Piel Mítica")).toBeInTheDocument();
    expect(screen.getByText("Diente Infectado")).toBeInTheDocument();
  });

  it("renders correctly in minimal3dOnly mode", () => {
    renderWithProviders(
      <WikiHostile3DCard minimal3dOnly bossName="Chupacabra" />,
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: /Chupacabra/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Visualizador 3D Hostil/i }),
    ).not.toBeInTheDocument();
  });

  it("handles camera reset and fullscreen buttons", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiHostile3DCard bossName="Chupacabra" />);

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

  it("handles mouse drag rotation on 3D viewport", () => {
    renderWithProviders(<WikiHostile3DCard bossName="Chupacabra" />);

    const viewport = screen.getByRole("region", {
      name: /Visualizador 3D Hostil/i,
    });
    fireEvent.mouseDown(viewport, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(viewport, { clientX: 180, clientY: 140 });
    fireEvent.mouseUp(viewport);
  });
});
