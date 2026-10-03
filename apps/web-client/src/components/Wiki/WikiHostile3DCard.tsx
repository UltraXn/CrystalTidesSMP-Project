import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ReactMarkdown from 'react-markdown';
import {
  Skull,
  AlertTriangle,
  Shield,
  Zap,
  Compass,
  MapPin,
  Award,
  Coins,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUtils';

export interface WikiHostile3DCardProps {
  minimal3dOnly?: boolean;
  modelPath?: string;
  bossName?: string;
  subtitle?: string;
  hp?: string;
  damage?: string;
  speed?: string;
  location?: string;
  spawnMethod?: string;
  description?: string;
  drops?: string[];
  kcReward?: number;
}

const DEFAULT_DROPS = ['Piel Mítica', 'Diente Infectado'];

export const WikiHostile3DCard: React.FC<Readonly<WikiHostile3DCardProps>> = ({
  minimal3dOnly = false,
  modelPath = '/models/mythology/chupacabra.gltf',
  bossName = 'Chupacabra',
  subtitle = 'Criatura Hostil Mitológica',
  hp = '40 HP (20 Corazones)',
  damage = '8 HP (Daño Físico)',
  speed = '0.35 (Marcha Agresiva)',
  location = 'Bosques Nocturnos & Cavernas',
  spawnMethod = 'Generación Natural Nocturna',
  description = 'Depredador nocturno sediento de sangre con mandíbulas retráctiles que acecha en la oscuridad.',
  drops = DEFAULT_DROPS,
  kcReward = 150,
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
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const redLight = new THREE.DirectionalLight(0xef4444, 2.2);
    redLight.position.set(3, 5, 4);
    scene.add(redLight);

    const orangeFill = new THREE.PointLight(0xf97316, 1.5, 10);
    orangeFill.position.set(-3, 2, -2);
    scene.add(orangeFill);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Fallback Octahedron Crystal if GLTF fails
    const createProceduralFallback = () => {
      const geo = new THREE.OctahedronGeometry(0.8, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
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
              mat.roughness = 0.5;
              mat.metalness = 0.2;
            }
          }
        });

        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        loadedModel.position.sub(center);
        const scale = 1.6 / maxDim;
        modelGroup.scale.setScalar(scale);
        modelGroup.add(loadedModel);

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(loadedModel);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
          mixerRef.current = mixer;
        }

        setIsLoading(false);
      },
      undefined,
      () => {
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
          (targetRotationRef.current.x - modelGroupRef.current.rotation.x) * 0.08;
        modelGroupRef.current.rotation.y +=
          (targetRotationRef.current.y - modelGroupRef.current.rotation.y) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
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
      <div className="bg-radial relative flex h-full min-h-80 w-full cursor-grab items-center justify-center overflow-hidden rounded-2xl border border-red-500/20 from-red-950/30 via-black to-black active:cursor-grabbing">
        {isLoading && (
          <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
            <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-red-400">
              Cargando 3D...
            </span>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0 z-10 h-full w-full" />
      </div>
    );
  }

  return (
    <div className="my-1 w-full">
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-[#120606]/90 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
          {/* 3D Viewport Column */}
          <div
            role="region"
            aria-label="Visualizador 3D Hostil"
            tabIndex={0}
            className="min-h-95 bg-radial relative flex h-full w-full cursor-grab items-center justify-center overflow-hidden border-b border-red-500/20 from-red-950/40 via-black to-black outline-none focus:outline-none active:cursor-grabbing lg:col-span-5 lg:border-b-0 lg:border-r"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isLoading && (
              <div className="backdrop-blur-xs absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-red-400">
                  Cargando 3D...
                </span>
              </div>
            )}

            <div ref={containerRef} className="absolute inset-0 z-10 h-full w-full" />

            {/* Controls */}
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetView}
                aria-label="Reiniciar cámara"
                className="cursor-pointer rounded-lg border border-red-500/30 bg-black/60 p-1.5 text-red-400 transition-all hover:bg-red-500/20"
                title="Reiniciar Cámara"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Pantalla completa"
                className="cursor-pointer rounded-lg border border-red-500/30 bg-black/60 p-1.5 text-red-400 transition-all hover:bg-red-500/20"
                title="Pantalla Completa"
              >
                <Maximize2 aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Stats & Description Column */}
          <div className="flex flex-col justify-between space-y-3 p-5 lg:col-span-7">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400">
                <Skull className="h-3 w-3" /> Mobs of Mythology • {subtitle}
              </div>

              <h2 className="mb-1 text-xl font-black uppercase tracking-tight text-white">
                {bossName}
              </h2>

              {description && (
                <div className="mb-3 space-y-1.5 text-[11px] font-medium leading-relaxed text-gray-300 [&_p]:mb-1">
                  <ReactMarkdown>{description.replaceAll('\\n', '\n')}</ReactMarkdown>
                </div>
              )}

              {/* Attributes Grid */}
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-orange-500/10 p-1.5 text-orange-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Nivel de Amenaza
                    </div>
                    <div className="text-[11px] font-bold text-orange-300">Hostil (Depredador)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-red-500/10 p-1.5 text-red-400">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Salud de Combate
                    </div>
                    <div className="text-[11px] font-bold text-white">{hp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Poder de Daño
                    </div>
                    <div className="text-[11px] font-bold text-white">{damage}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400">
                    <Compass className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                      Velocidad
                    </div>
                    <div className="text-[11px] font-bold text-white">{speed}</div>
                  </div>
                </div>
              </div>

              {/* Location & Spawn */}
              <div className="mb-2 space-y-1 rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <MapPin size={12} /> Ubicación & Aparición
                </div>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Hábitat:</strong> {location}
                </p>
                <p className="text-[10px] font-medium leading-tight text-gray-300">
                  <strong className="text-white">Aparición:</strong> {spawnMethod}
                </p>
              </div>

              {/* Drops */}
              <div className="mb-2">
                <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Award className="h-3.5 w-3.5 text-amber-400" /> Botín de Caza
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {drops.map((drop) => (
                    <span
                      key={drop}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-200"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                      {drop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kill Bounty Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
                <Coins size={14} />
                <span>Recompensa de Caza</span>
              </div>
              <span className="font-mono text-base font-black text-amber-300">
                +{kcReward.toLocaleString()} KC
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiHostile3DCard;
