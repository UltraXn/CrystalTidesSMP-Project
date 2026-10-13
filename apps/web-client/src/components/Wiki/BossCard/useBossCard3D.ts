import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { resolveAssetUrl } from '../../../utils/assetUtils';
import { BossAttack } from './defaultBossData';
import { BossCardTheme } from './bossCardTheme';

const SEARCH_TERMS = [
  'attack',
  'bite',
  'claw',
  'shoot',
  'smash',
  'slam',
  'slash',
  'roar',
  'punch',
  'strike',
  'jump',
  'roll',
  'eat',
  'idle',
];

function configureMeshMaterials(child: THREE.Object3D): void {
  if (child instanceof THREE.Mesh) {
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (mat.map) {
        mat.map.magFilter = THREE.NearestFilter;
        mat.map.minFilter = THREE.NearestFilter;
        mat.map.needsUpdate = true;
      }
      mat.side = THREE.DoubleSide;
    }
  }
}

interface UseBossCard3DProps {
  activeModel: string;
  themeStyles: BossCardTheme;
  cardWrapperRef: React.RefObject<HTMLDivElement | null>;
  selectedAttack: BossAttack | null;
  activeClipOverride?: string | null;
}

export function useBossCard3D({
  activeModel,
  themeStyles,
  cardWrapperRef,
  selectedAttack,
  activeClipOverride,
}: UseBossCard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const activeClipsRef = useRef<THREE.AnimationClip[]>([]);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  function findTargetClip(
    clips: THREE.AnimationClip[],
    clipNameToSearch?: string | null,
  ): THREE.AnimationClip | undefined {
    if (clipNameToSearch) {
      const clipNameLower = clipNameToSearch.toLowerCase();
      const exactOrSub =
        clips.find((c) => c.name.toLowerCase() === clipNameLower) ??
        clips.find((c) => c.name.toLowerCase().includes(clipNameLower));
      if (exactOrSub) return exactOrSub;
    }

    for (const term of SEARCH_TERMS) {
      const matched = clips.find((c) => c.name.toLowerCase().includes(term));
      if (matched) return matched;
    }
    return undefined;
  }

  function playClipAction(
    mixer: THREE.AnimationMixer,
    clip: THREE.AnimationClip,
    currentActionRef: React.RefObject<THREE.AnimationAction | null>,
  ): void {
    try {
      currentActionRef.current?.stop();
      const action = mixer.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      currentActionRef.current = action;
    } catch (err) {
      console.warn('Failed to play attack clip:', err);
    }
  }

  // Play animation clip
  useEffect(() => {
    const mixer = activeMixerRef.current;
    const clips = activeClipsRef.current;
    if (!mixer || !clips.length) return;

    const clipNameToSearch = activeClipOverride ?? selectedAttack?.animation_clip;
    const targetClip = findTargetClip(clips, clipNameToSearch);
    if (targetClip) {
      playClipAction(mixer, targetClip, currentActionRef);
    }
  }, [selectedAttack, activeClipOverride]);

  // Three.js Canvas Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.6);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-4, -2, -4);
    scene.add(backLight);

    const gridHelper = new THREE.GridHelper(3.5, 10, themeStyles.grid1, themeStyles.grid2);
    gridHelper.position.y = -0.02;
    scene.add(gridHelper);

    let lastTime = performance.now();

    renderer.setAnimationLoop(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (activeMixerRef.current) {
        activeMixerRef.current.update(delta);
      }

      if (modelRef.current && !isDraggingRef.current) {
        modelRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    });

    setIsLoading(true);
    const loader = new GLTFLoader();
    const resolvedUrl = resolveAssetUrl(activeModel);

    loader.load(
      resolvedUrl,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / (maxDim || 1);
        model.scale.setScalar(scale);

        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale;
        model.position.z = -center.z * scale;

        model.traverse(configureMeshMaterials);

        activeClipsRef.current = gltf.animations || [];

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          activeMixerRef.current = mixer;

          const firstClip = gltf.animations[0];
          const action = mixer.clipAction(firstClip);
          action.play();
          currentActionRef.current = action;
        }

        scene.add(model);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.warn('Failed to load GLTF in WikiBoss3DCard:', error);
        setIsLoading(false);
      },
    );

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !modelRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      modelRef.current.rotation.y += deltaX * 0.01;
      modelRef.current.rotation.x += deltaY * 0.01;
      modelRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, modelRef.current.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [activeModel, themeStyles]);

  const resetView = () => {
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
  };

  const toggleFullscreen = () => {
    if (!cardWrapperRef.current) return;
    if (!document.fullscreenElement) {
      cardWrapperRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return {
    containerRef,
    isLoading,
    resetView,
    toggleFullscreen,
  };
}
