import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import WikiBoss3DCard from "@/components/Wiki/WikiBoss3DCard";

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
    get domElement() {
      return document.createElement("canvas");
    }
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    shadowMap = { enabled: false, type: 0 };
    toneMapping = 0;
    toneMappingExposure = 1;
    outputColorSpace = "srgb";
  },
  AmbientLight: class {},
  DirectionalLight: class {
    position = { set: vi.fn() };
  },
  PointLight: class {
    position = { set: vi.fn() };
  },
  RingGeometry: class {},
  MeshBasicMaterial: class {},
  Mesh: class {
    position = { set: vi.fn(), sub: vi.fn(), x: 0, y: 0, z: 0 };
    rotation = { set: vi.fn(), x: 0, y: 0 };
    traverse = vi.fn();
  },
  GridHelper: class {
    position = { y: 0 };
  },
  Clock: class {
    getDelta = vi.fn().mockReturnValue(0.016);
  },
  AnimationMixer: class {
    update = vi.fn();
    clipAction = vi.fn().mockReturnValue({
      play: vi.fn(),
      reset: vi.fn(),
      stop: vi.fn(),
      setLoop: vi.fn(),
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
    x = 0;
    y = 0;
    z = 0;
    sub = vi.fn();
    multiplyScalar = vi.fn();
  },
  DoubleSide: 2,
  NearestFilter: 1003,
  LinearSRGBColorSpace: "srgb-linear",
  SRGBColorSpace: "srgb",
  PCFSoftShadowMap: 2,
  ACESFilmicToneMapping: 1,
  LoopRepeat: 1000,
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

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("WikiBoss3DCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  it("renders 3D viewport and boss details", () => {
    renderWithProviders(
      <WikiBoss3DCard
        bossName="Ignis, Flame Monarch"
        subtitle="Señor del Nether"
        category="Jefes de Cataclysm"
        hp="800 HP"
        damage="45 HP"
        armor="15"
        speed="Rápido"
        location="Fortaleza Subterránea"
        description="Jefe ancestral nacido del núcleo ígneo."
        kcReward={150}
      />,
    );

    expect(
      screen.getByRole("region", { name: /Visualizador 3D interactivo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Ignis, Flame Monarch/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Señor del Nether")).toBeInTheDocument();
  });

  it("renders phase switcher buttons when multiple phases are configured", () => {
    const phases = [
      { phase_number: 1, phase_name: "Fase Normal", hp: "800 HP" },
      { phase_number: 2, phase_name: "Fase Furia", hp: "400 HP" },
    ];

    renderWithProviders(
      <WikiBoss3DCard bossName="Harbinger" phases={phases} />,
    );

    expect(
      screen.getByRole("button", { name: /Fase Normal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Fase Furia/i }),
    ).toBeInTheDocument();

    const phase2Btn = screen.getByRole("button", { name: /Fase Furia/i });
    fireEvent.click(phase2Btn);

    expect(phase2Btn).toHaveAttribute("aria-pressed", "true");
  });

  it("renders floating 3D control buttons for resetting camera and fullscreen", () => {
    renderWithProviders(<WikiBoss3DCard bossName="Leviathan" />);

    expect(
      screen.getByRole("button", { name: /Reiniciar cámara 360°/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pantalla completa 3D/i }),
    ).toBeInTheDocument();
  });
});
