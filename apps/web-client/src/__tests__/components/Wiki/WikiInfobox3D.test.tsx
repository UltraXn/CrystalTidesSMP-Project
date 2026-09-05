import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import WikiInfobox3D from "@/components/Wiki/WikiInfobox3D";
import { renderWithProviders } from "@/utils/test-utils";
import { WikiArticle } from "@/services/wikiService";

vi.mock("three", () => ({
  Scene: class {
    add = vi.fn();
    remove = vi.fn();
  },
  PerspectiveCamera: class {
    position = { set: vi.fn() };
    lookAt = vi.fn();
  },
  WebGLRenderer: class {
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
  },
  AmbientLight: class {},
  DirectionalLight: class {
    position = { set: vi.fn() };
  },
  RingGeometry: class {},
  MeshBasicMaterial: class {},
  Mesh: class {
    position = { set: vi.fn(), y: 0 };
    rotation = { set: vi.fn(), x: 0, y: 0 };
  },
  GridHelper: class {
    position = { y: 0 };
  },
  Clock: class {
    getDelta = vi.fn().mockReturnValue(0.016);
  },
  ACESFilmicToneMapping: 1,
  SRGBColorSpace: "srgb",
  DoubleSide: 2,
  AnimationMixer: class {
    update = vi.fn();
    clipAction = vi.fn();
  },
  Box3: class {
    setFromObject = vi.fn().mockReturnThis();
    getSize = vi.fn().mockReturnValue({ x: 1, y: 1, z: 1 });
    getCenter = vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 });
  },
  Vector3: class {
    sub = vi.fn();
    multiplyScalar = vi.fn();
  },
}));

vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: class {
    load = vi.fn();
  },
}));

describe("WikiInfobox3D", () => {
  const sampleArticle: WikiArticle = {
    id: 10,
    slug: "ignis",
    title: "Ignis, the Flame Monarch",
    content: "Legendary boss forged in deep Nether magma.",
    category: "bosses",
    boss_mod_name: "Cataclysm",
    boss_hp: "800",
    boss_damage: "45",
    model_3d_url: "/models/ignis.glb",
    author_id: "author-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("renders technical infobox header, title, and mod name", () => {
    renderWithProviders(<WikiInfobox3D article={sampleArticle} />);

    expect(screen.getByText("Ficha de Entidad Oficial")).toBeInTheDocument();
    expect(
      screen.getByText("Ignis, the Flame Monarch")
    ).toBeInTheDocument();
    expect(screen.getByText("Cataclysm")).toBeInTheDocument();
  });

  it("renders 3D model viewport canvas when model_3d_url is defined", () => {
    renderWithProviders(<WikiInfobox3D article={sampleArticle} />);

    const canvas = screen.getByRole("img", {
      name: /Modelo 3D interactivo de Ignis/i,
    });
    expect(canvas).toBeInTheDocument();
    expect(screen.getByText(/Arrastra para rotar 360°/i)).toBeInTheDocument();
  });
});
