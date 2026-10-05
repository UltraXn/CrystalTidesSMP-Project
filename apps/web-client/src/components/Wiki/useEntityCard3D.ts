import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { resolveAssetUrl } from '../../utils/assetUtils';

export interface EntityCard3DConfig {
  modelPath: string;
  dirLightColor: number;
  dirLightIntensity?: number;
  pointLightColor: number;
  pointLightIntensity?: number;
  fallbackColor: number;
  fallbackEmissive: number;
  roughness?: number;
  metalness?: number;
}

export function useEntityCard3D(config: EntityCard3DConfig) {
  const {
    modelPath,
    dirLightColor,
    dirLightIntensity = 2.0,
    pointLightColor,
    pointLightIntensity = 1.5,
    fallbackColor,
    fallbackEmissive,
    roughness = 0.5,
    metalness = 0.2,
  } = config;

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(dirLightColor, dirLightIntensity);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const pointFill = new THREE.PointLight(pointLightColor, pointLightIntensity, 10);
    pointFill.position.set(-3, 2, -2);
    scene.add(pointFill);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const createProceduralFallback = () => {
      const geo = new THREE.OctahedronGeometry(0.8, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: fallbackColor,
        wireframe: true,
        emissive: fallbackEmissive,
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
              mat.roughness = roughness;
              mat.metalness = metalness;
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

    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      if (mixerRef.current) mixerRef.current.update(delta);

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x +=
          (targetRotationRef.current.x - modelGroupRef.current.rotation.x) * 0.08;
        modelGroupRef.current.rotation.y +=
          (targetRotationRef.current.y - modelGroupRef.current.rotation.y) * 0.08;
      }

      renderer.render(scene, camera);
    });

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
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [
    modelPath,
    dirLightColor,
    dirLightIntensity,
    pointLightColor,
    pointLightIntensity,
    fallbackColor,
    fallbackEmissive,
    roughness,
    metalness,
  ]);

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

  return {
    containerRef,
    isLoading,
    resetView,
    toggleFullscreen,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
