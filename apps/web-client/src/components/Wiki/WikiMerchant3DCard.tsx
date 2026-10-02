import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import ReactMarkdown from "react-markdown";
import {
  ShoppingBag,
  Coins,
  Store,
  Shield,
  Compass,
  MapPin,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { resolveAssetUrl } from "../../utils/assetUtils";

export interface WikiMerchant3DCardProps {
  minimal3dOnly?: boolean;
  modelPath?: string;
  bossName?: string;
  subtitle?: string;
  hp?: string;
  currency?: string;
  location?: string;
  description?: string;
  trades?: string[];
}

export const WikiMerchant3DCard: React.FC<WikiMerchant3DCardProps> = ({
  minimal3dOnly = false,
  modelPath = "/models/ribbits/ribbit_merchant.gltf",
  bossName = "Merchant Ribbit",
  subtitle = "Mercader Ambulante",
  hp = "30 HP (Protegido)",
  currency = "KilluCoins (KC) / Esmeraldas",
  location = "Pantanos, Ríos y Aldeas",
  description = "Comerciante itinerante de la raza Ribbit que ofrece semillas exóticas y artefactos de pesca.",
  trades = ["Semillas Raras", "Señuelos Míticos", "Ingredientes de Alquimia"],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.15, y: 0.8 });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  const resetView = useCallback(() => {
    targetRotationRef.current = { x: 0.15, y: 0.8 };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current?.parentElement) return;
    if (!document.fullscreenElement) {
      containerRef.current.parentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    setIsLoading(true);

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const amberLight = new THREE.DirectionalLight(0xf59e0b, 2.0);
    amberLight.position.set(3, 5, 4);
    scene.add(amberLight);

    const purpleFill = new THREE.PointLight(0x8b5cf6, 1.5, 10);
    purpleFill.position.set(-3, 2, -2);
    scene.add(purpleFill);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const createProceduralFallback = () => {
      const geo = new THREE.OctahedronGeometry(0.8, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        wireframe: true,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      modelGroup.add(mesh);
      setIsLoading(false);
    };

    const loader = new GLTFLoader();
    loader.load(
      resolveAssetUrl(modelPath),
      (gltf) => {
        modelGroup.clear();
        const loadedModel = gltf.scene;

        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.6;
              mat.metalness = 0.1;
            }
          }
        });

        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        const targetHeight = 2.0;
        const scale = targetHeight / maxDim;
        loadedModel.scale.setScalar(scale);
        loadedModel.position.set(
          -center.x * scale,
          -center.y * scale - 0.2,
          -center.z * scale,
        );

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(loadedModel);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
          mixerRef.current = mixer;
        }

        modelGroup.add(loadedModel);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.warn("GLTF load failed, using procedural fallback:", err);
        createProceduralFallback();
      },
    );

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixerRef.current) mixerRef.current.update(delta);

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x +=
          (targetRotationRef.current.x - modelGroupRef.current.rotation.x) *
          0.08;
        modelGroupRef.current.rotation.y +=
          (targetRotationRef.current.y - modelGroupRef.current.rotation.y) *
          0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current)
        return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [modelPath]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    targetRotationRef.current.y += deltaX * 0.01;
    targetRotationRef.current.x = Math.max(
      -0.6,
      Math.min(0.6, targetRotationRef.current.x + deltaY * 0.01),
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  if (minimal3dOnly) {
    return (
      <div className="bg-radial relative flex h-full min-h-80 w-full cursor-grab items-center justify-center overflow-hidden rounded-2xl border border-amber-500/20 from-amber-950/20 via-black to-black active:cursor-grabbing">
        {isLoading && (
          <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
            <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400">
              Cargando 3D...
            </span>
          </div>
        )}
        <div
          ref={containerRef}
          className="absolute inset-0 z-10 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="my-1 w-full">
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-[#120e06]/90 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
          {/* 3D Viewport Column */}
          <div
            aria-label="Visualizador 3D Mercader"
            className="min-h-95 bg-radial relative flex h-full w-full cursor-grab items-center justify-center overflow-hidden border-b border-amber-500/20 from-amber-950/30 via-black to-black outline-none active:cursor-grabbing lg:col-span-5 lg:border-b-0 lg:border-r"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isLoading && (
              <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400">
                  Cargando 3D...
                </span>
              </div>
            )}

            <div
              ref={containerRef}
              className="absolute inset-0 z-10 h-full w-full"
            />

            {/* Controls */}
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetView}
                aria-label="Reiniciar cámara"
                className="cursor-pointer rounded-lg border border-amber-500/30 bg-black/60 p-1.5 text-amber-400 transition-all hover:bg-amber-500/20"
                title="Reiniciar Cámara"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Pantalla completa"
                className="cursor-pointer rounded-lg border border-amber-500/30 bg-black/60 p-1.5 text-amber-400 transition-all hover:bg-amber-500/20"
                title="Pantalla Completa"
              >
                <Maximize2 aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Stats & Description Column */}
          <div className="flex flex-col justify-between space-y-3 p-5 lg:col-span-7">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400">
                <ShoppingBag className="h-3 w-3" /> Ribbits & Traders •{" "}
                {subtitle}
              </div>

              <h2 className="mb-1 text-xl font-black uppercase tracking-tight text-white">
                {bossName}
              </h2>

              {description && (
                <div className="mb-3 space-y-1.5 text-[11px] font-medium leading-relaxed text-gray-300 [&_p]:mb-1">
                  <ReactMarkdown>
                    {description.replace(/\\n/g, "\n")}
                  </ReactMarkdown>
                </div>
              )}

              {/* Attributes Grid */}
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                    <Coins className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Moneda de Cambio
                    </div>
                    <div className="text-[11px] font-bold text-amber-300">
                      {currency}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-400">
                    <Store className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Especialidad de Tienda
                    </div>
                    <div className="text-[11px] font-bold text-white">
                      Mercader de Pantano & Ríos
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-400">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Resistencia NPC
                    </div>
                    <div className="text-[11px] font-bold text-white">{hp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                    <Compass className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Disponibilidad
                    </div>
                    <div className="text-[11px] font-bold text-white">
                      Encuentro Frecuente
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Catalogue Sheet */}
              <div className="mb-3 space-y-2 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    <ShoppingBag size={13} /> Catálogo de Intercambio Offered
                  </div>
                  <span className="font-mono text-[9px] text-gray-400">
                    Tienda de Aldea
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trades.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-amber-200"
                    >
                      🪙 {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <MapPin size={12} /> Ubicación de Encuentro
                </div>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Ubicación:</strong> {location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiMerchant3DCard;
