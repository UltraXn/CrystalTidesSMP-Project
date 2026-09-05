import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import WikiMerchant3DCard from "@/components/Wiki/WikiMerchant3DCard";

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

describe("WikiMerchant3DCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3D viewport, merchant details, currency, trades, and location", () => {
    renderWithProviders(
      <WikiMerchant3DCard
        bossName="Merchant Ribbit"
        subtitle="Mercader Ambulante"
        hp="30 HP (Protegido)"
        currency="KilluCoins (KC) / Esmeraldas"
        location="Pantanos, Ríos y Aldeas"
        description="Comerciante itinerante de la raza Ribbit que ofrece semillas exóticas."
        trades={["Semillas Raras", "Señuelos Míticos", "Ingredientes de Alquimia"]}
      />,
    );

    expect(
      screen.getByRole("region", { name: /Visualizador 3D Mercader/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Merchant Ribbit/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Mercader Ambulante/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Comerciante itinerante de la raza Ribbit/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("KilluCoins (KC) / Esmeraldas"),
    ).toBeInTheDocument();
    expect(screen.getByText("30 HP (Protegido)")).toBeInTheDocument();
    expect(
      screen.getByText(/Pantanos, Ríos y Aldeas/),
    ).toBeInTheDocument();
    expect(screen.getByText("🪙 Semillas Raras")).toBeInTheDocument();
    expect(screen.getByText("🪙 Señuelos Míticos")).toBeInTheDocument();
    expect(
      screen.getByText("🪙 Ingredientes de Alquimia"),
    ).toBeInTheDocument();
  });

  it("renders correctly in minimal3dOnly mode", () => {
    renderWithProviders(
      <WikiMerchant3DCard minimal3dOnly bossName="Merchant Ribbit" />,
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: /Merchant Ribbit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Visualizador 3D Mercader/i }),
    ).not.toBeInTheDocument();
  });

  it("handles camera reset and fullscreen buttons", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WikiMerchant3DCard bossName="Merchant Ribbit" />);

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
    renderWithProviders(<WikiMerchant3DCard bossName="Merchant Ribbit" />);

    const viewport = screen.getByRole("region", {
      name: /Visualizador 3D Mercader/i,
    });
    fireEvent.mouseDown(viewport, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(viewport, { clientX: 160, clientY: 130 });
    fireEvent.mouseUp(viewport);
  });
});
