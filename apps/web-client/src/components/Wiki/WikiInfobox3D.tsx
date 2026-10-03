import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  Heart,
  Swords,
  Shield,
  Zap,
  MapPin,
  Coins,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { WikiArticle } from '../../services/wikiService';
import { resolveAssetUrl } from '../../utils/assetUtils';

interface WikiInfobox3DProps {
  article: WikiArticle;
}

export default function WikiInfobox3D({ article }: Readonly<WikiInfobox3DProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState<number>(1);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const hasMultiplePhases = Boolean(
    article.model_3d_url_phase_2 || (article.boss_phases && article.boss_phases.length > 1),
  );

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentModelRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const reqIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const modelPath =
    activePhase === 2 && article.model_3d_url_phase_2
      ? article.model_3d_url_phase_2
      : article.model_3d_url;

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    clockRef.current = new THREE.Clock();

    const container = containerRef.current;
    const width = container.clientWidth || 320;
    const height = 260;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x89d9d1, 1.2);
    backLight.position.set(-4, -2, -4);
    scene.add(backLight);

    // Subtle Pedestal Ring with CrystalTides Mint
    const ringGeo = new THREE.RingGeometry(1.1, 1.15, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x89d9d1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.02;
    scene.add(ringMesh);

    // Grid floor
    const gridHelper = new THREE.GridHelper(3, 8, 0x168c80, 0x0c5952);
    gridHelper.position.y = -0.03;
    scene.add(gridHelper);

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current ? clockRef.current.getDelta() : 0;

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (currentModelRef.current && !isDraggingRef.current) {
        currentModelRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || 320;
      const h = 260;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      ringGeo.dispose?.();
      ringMat.dispose?.();
      renderer.dispose?.();
    };
  }, []);

  // Load GLTF Model
  useEffect(() => {
    if (!modelPath || !sceneRef.current) return;

    setIsLoadingModel(true);
    setModelError(null);

    if (currentModelRef.current && sceneRef.current) {
      sceneRef.current.remove(currentModelRef.current);
      currentModelRef.current = null;
    }
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }

    const loader = new GLTFLoader();
    const resolvedUrl = resolveAssetUrl(modelPath);

    loader.load(
      resolvedUrl,
      (gltf) => {
        if (!sceneRef.current) return;
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / (maxDim || 1);
        model.scale.setScalar(scale);

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale;
        model.position.z = -center.z * scale;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
              if (mat.map) {
                mat.map.magFilter = THREE.NearestFilter;
                mat.map.minFilter = THREE.NearestFilter;
                mat.map.needsUpdate = true;
              }
              mat.side = THREE.DoubleSide;
            });
          }
        });

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        sceneRef.current.add(model);
        currentModelRef.current = model;
        setIsLoadingModel(false);
      },
      undefined,
      (error) => {
        console.warn('Failed to load GLTF in infobox:', error);
        setModelError('Modelo no disponible');
        setIsLoadingModel(false);
      },
    );
  }, [modelPath]);

  // Mouse Drag Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !currentModelRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    currentModelRef.current.rotation.y += deltaX * 0.01;
    currentModelRef.current.rotation.x += deltaY * 0.01;

    currentModelRef.current.rotation.x = Math.max(
      -0.5,
      Math.min(0.5, currentModelRef.current.rotation.x),
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetRotation = () => {
    if (currentModelRef.current) {
      currentModelRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <aside
      aria-label={`Ficha técnica de ${article.title}`}
      className="lg:w-84 sticky top-24 w-full shrink-0 space-y-5 self-start rounded-3xl border border-[#168c80]/40 bg-[#0b0c10]/90 p-5 shadow-2xl backdrop-blur-xl"
    >
      {/* Infobox Header */}
      <div className="border-b border-white/10 pb-3 text-center">
        <div className="text-(--accent) mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#89d9d1]/40 bg-[#168c80]/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-inner">
          <Sparkles size={11} aria-hidden="true" />
          <span>Ficha de Entidad Oficial</span>
        </div>
        <h2 className="text-lg font-black leading-tight tracking-tight text-white">
          {article.title}
        </h2>
        {article.boss_mod_name && (
          <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold text-white/60">
            <Layers size={12} aria-hidden="true" className="text-(--accent)" />
            <span>{article.boss_mod_name}</span>
          </p>
        )}
      </div>

      {/* 3D Model Specimen Viewport */}
      {article.model_3d_url && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner">
          <div
            ref={containerRef}
            role="region"
            aria-label="Contenedor interactivo del modelo 3D"
            tabIndex={0}
            className="h-65 relative flex w-full cursor-grab items-center justify-center focus:outline-none active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Modelo 3D interactivo de ${article.title}`}
              className="block h-full w-full"
            />

            {isLoadingModel && (
              <div className="text-(--accent) absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 backdrop-blur-sm">
                <Sparkles size={24} aria-hidden="true" className="text-(--accent) animate-spin" />
                <span className="text-[11px] font-bold">Invocando Modelo 3D...</span>
              </div>
            )}

            {modelError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-4 text-center text-amber-400">
                <AlertTriangle size={24} aria-hidden="true" />
                <span className="text-xs font-bold">{modelError}</span>
              </div>
            )}

            {/* Viewport Floating Controls */}
            <div className="absolute right-2 top-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetRotation}
                aria-label="Restablecer rotación 3D"
                className="hover:text-(--accent) cursor-pointer rounded-lg border border-white/10 bg-black/60 p-1.5 text-xs text-white/70 transition-colors hover:bg-[#168c80]/40"
                title="Restablecer Rotación"
              >
                <RotateCcw size={13} aria-hidden="true" />
              </button>
            </div>

            <div className="absolute bottom-2 left-2 font-mono text-[10px] tracking-wider text-white/40">
              Arrastra para rotar 360°
            </div>
          </div>

          {/* Phase Switcher */}
          {hasMultiplePhases && (
            <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-[#06070b]/90 p-2">
              <button
                type="button"
                aria-pressed={activePhase === 1}
                onClick={() => setActivePhase(1)}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-black transition-all ${
                  activePhase === 1
                    ? 'bg-[#168c80] text-white shadow-md'
                    : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                Fase 1
              </button>
              <button
                type="button"
                aria-pressed={activePhase === 2}
                onClick={() => setActivePhase(2)}
                className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-black transition-all ${
                  activePhase === 2
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                Fase 2 (Frenesí)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Structured Key-Value Data Table */}
      <div className="space-y-2 text-xs">
        <div className="text-(--accent) border-b border-white/10 pb-1 text-[11px] font-black uppercase tracking-wider">
          Estadísticas & Atributos
        </div>

        <div className="space-y-1.5 divide-y divide-white/5">
          {/* Category */}
          <div className="flex items-center justify-between pt-1.5">
            <span className="font-medium text-white/50">Categoría</span>
            <span className="font-bold capitalize text-white">
              {article.category?.replaceAll('_', ' ') || 'General'}
            </span>
          </div>

          {/* Health */}
          {article.boss_hp && (
            <div className="flex items-center justify-between pt-1.5">
              <span className="flex items-center gap-1.5 font-medium text-white/50">
                <Heart size={13} aria-hidden="true" className="text-red-400" /> Puntos de Vida
              </span>
              <span className="font-mono font-black tabular-nums text-red-300">
                {activePhase === 2 && article.boss_hp_phase_2
                  ? article.boss_hp_phase_2
                  : article.boss_hp}
              </span>
            </div>
          )}

          {/* Damage */}
          {article.boss_damage && (
            <div className="flex items-center justify-between pt-1.5">
              <span className="flex items-center gap-1.5 font-medium text-white/50">
                <Swords size={13} aria-hidden="true" className="text-amber-400" /> Poder de Ataque
              </span>
              <span className="max-w-35 truncate text-right font-bold tabular-nums text-amber-200">
                {activePhase === 2 && article.boss_damage_phase_2
                  ? article.boss_damage_phase_2
                  : article.boss_damage}
              </span>
            </div>
          )}

          {/* Armor */}
          {article.boss_armor && (
            <div className="flex items-center justify-between pt-1.5">
              <span className="flex items-center gap-1.5 font-medium text-white/50">
                <Shield size={13} aria-hidden="true" className="text-blue-400" /> Armadura
              </span>
              <span className="max-w-35 truncate text-right font-semibold tabular-nums text-white/90">
                {article.boss_armor}
              </span>
            </div>
          )}

          {/* Speed */}
          {article.boss_speed && (
            <div className="flex items-center justify-between pt-1.5">
              <span className="flex items-center gap-1.5 font-medium text-white/50">
                <Zap size={13} aria-hidden="true" className="text-yellow-400" /> Velocidad
              </span>
              <span className="font-mono tabular-nums text-white/80">{article.boss_speed}</span>
            </div>
          )}

          {/* Habitat / Location */}
          {article.boss_location && (
            <div className="flex items-start justify-between gap-2 pt-1.5">
              <span className="flex shrink-0 items-center gap-1.5 font-medium text-white/50">
                <MapPin size={13} aria-hidden="true" className="text-(--accent)" /> Hábitat
              </span>
              <span className="text-right font-medium text-white/90">{article.boss_location}</span>
            </div>
          )}

          {/* Spawn Method */}
          {article.boss_spawn_method && (
            <div className="flex items-start justify-between gap-2 pt-1.5">
              <span className="shrink-0 font-medium text-white/50">Aparición</span>
              <span className="text-right text-[11px] font-medium text-white/80">
                {article.boss_spawn_method}
              </span>
            </div>
          )}

          {/* KilluCoins Bounty */}
          {article.boss_kc_reward ? (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 pb-1 pt-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <Coins size={14} aria-hidden="true" /> Recompensa de Caza
              </span>
              <span className="font-mono text-sm font-black tabular-nums text-amber-300">
                +{article.boss_kc_reward} KC
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Drops Table */}
      {article.boss_drops && article.boss_drops.length > 0 && (
        <div className="space-y-2 border-t border-white/10 pt-2">
          <div className="text-(--accent) text-[11px] font-black uppercase tracking-wider">
            Tabla de Botín / Drops
          </div>
          <div className="space-y-1">
            {article.boss_drops.map((drop) => (
              <div
                key={`drop-${drop}`}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-black/40 p-2 text-xs"
              >
                <span className="font-medium text-white/80">{drop.split('(')[0].trim()}</span>
                <span className="text-(--accent) rounded-md border border-[#89d9d1]/20 bg-[#168c80]/20 px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums">
                  {drop.includes('(') ? `(${drop.split('(')[1]}` : '100%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
