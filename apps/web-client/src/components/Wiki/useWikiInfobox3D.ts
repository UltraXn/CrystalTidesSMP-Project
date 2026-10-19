import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { resolveCachedAssetUrl } from '../../utils/r2AssetCache';

function configureInfoboxMaterials(child: THREE.Object3D): void {
  if (!(child instanceof THREE.Mesh)) return;
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

export function useWikiInfobox3D(modelPath: string | null | undefined) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<{
    path: string | null;
    loading: boolean;
    error: string | null;
  }>({
    path: null,
    loading: true,
    error: null,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentModelRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const isLoadingModel = loadState.path !== (modelPath ?? null) || loadState.loading;
  const modelError = loadState.path === (modelPath ?? null) ? loadState.error : null;

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    lastTimeRef.current = performance.now();

    const container = containerRef.current;
    const width = container.clientWidth || 320;
    const height = 260;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.5);
    cameraRef.current = camera;

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

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    renderer.domElement?.addEventListener?.('webglcontextlost', handleContextLost);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x89d9d1, 1.2);
    backLight.position.set(-4, -2, -4);
    scene.add(backLight);

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

    const gridHelper = new THREE.GridHelper(3, 8, 0x168c80, 0x0c5952);
    gridHelper.position.y = -0.03;
    scene.add(gridHelper);

    renderer.setAnimationLoop(() => {
      const now = performance.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (currentModelRef.current && !isDraggingRef.current) {
        currentModelRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || 320;
      const h = 260;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
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

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      renderer.domElement?.removeEventListener?.('webglcontextlost', handleContextLost);
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      ringGeo.dispose?.();
      ringMat.dispose?.();
      renderer.forceContextLoss?.();
      renderer.dispose?.();
    };
  }, []);

  // Load GLTF Model
  useEffect(() => {
    if (!modelPath || !sceneRef.current) return;

    if (currentModelRef.current && sceneRef.current) {
      sceneRef.current.remove(currentModelRef.current);
      currentModelRef.current = null;
    }
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }

    let isCancelled = false;
    const loader = new GLTFLoader();

    resolveCachedAssetUrl(modelPath).then((resolvedUrl) => {
      if (isCancelled || !sceneRef.current) return;

      loader.load(
        resolvedUrl,
        (gltf) => {
          if (isCancelled || !sceneRef.current) return;
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

          model.traverse(configureInfoboxMaterials);

          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }

          sceneRef.current.add(model);
          currentModelRef.current = model;
          setLoadState({ path: modelPath, loading: false, error: null });
        },
        undefined,
        (error) => {
          if (isCancelled) return;
          console.warn('Failed to load GLTF in infobox:', error);
          setLoadState({ path: modelPath, loading: false, error: 'Modelo no disponible' });
        },
      );
    });

    return () => {
      isCancelled = true;
    };
  }, [modelPath]);

  const resetRotation = () => {
    if (currentModelRef.current) {
      currentModelRef.current.rotation.set(0, 0, 0);
    }
  };

  return {
    canvasRef,
    containerRef,
    isLoadingModel,
    modelError,
    resetRotation,
  };
}
