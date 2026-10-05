import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Minecraft3DSkullCanvasProps {
  className?: string;
  size?: number;
}

export const Minecraft3DSkullCanvas: React.FC<Readonly<Minecraft3DSkullCanvasProps>> = ({
  className = '',
  size = 44,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isSubscribed = true;
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // 2. Clear diffuse lighting with Cyan & Red accents (no PBR / no metalness)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Front neutral light — preserves original skull face texture & contrast
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
    frontLight.position.set(0, 0.5, 4);
    scene.add(frontLight);

    // Cyan key light from top-right
    const cyanLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    cyanLight.position.set(2.5, 3, 2);
    scene.add(cyanLight);

    // Red underglow from bottom-left
    const redLight = new THREE.DirectionalLight(0xff2244, 1.4);
    redLight.position.set(-1.5, -3, 1.5);
    scene.add(redLight);

    // 3. Main Group & GLTF Loader
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let mixer: THREE.AnimationMixer | null = null;

    const loader = new GLTFLoader();
    loader.load(
      '/models/toro_wither_skull.gltf',
      (gltf) => {
        if (!isSubscribed) return;

        const model = gltf.scene;

        // Hide hitboxes & apply pixel-art filtering with MeshLambertMaterial
        // (pure diffuse shading: reacts to lights with zero metalness/specular artifacts)
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const name = (child.name || '').toLowerCase();
            if (name.includes('hitbox') || name.includes('collider') || name.includes('bounding')) {
              child.visible = false;
              return;
            }

            const oldMats = Array.isArray(child.material) ? child.material : [child.material];
            const newMats = oldMats.map((mat) => {
              const lambert = new THREE.MeshLambertMaterial({
                map: mat.map ?? null,
                side: THREE.DoubleSide,
                transparent: true,
                alphaTest: 0.1,
              });
              if (lambert.map) {
                lambert.map.magFilter = THREE.NearestFilter;
                lambert.map.minFilter = THREE.NearestFilter;
                lambert.map.colorSpace = THREE.SRGBColorSpace;
              }
              return lambert;
            });
            child.material = newMats.length === 1 ? newMats[0] : newMats;
          }
        });

        // Center & Scale GLTF Model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const modelSize = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z) || 1;
        const scale = 1.8 / maxDim;

        // Lift vertical center slightly to keep the face/eyes perfectly centered
        // (compensates for neck spines at the bottom of the model)
        center.y += 0.07;

        model.scale.set(scale, scale, scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        const skullPivot = new THREE.Group();
        skullPivot.add(model);
        // Blockbench/ModelEngine GLTFs export face toward -Z;
        // rotate PI to face camera, then offset for 3/4 isometric view
        skullPivot.rotation.y = Math.PI + 0.38;
        skullPivot.rotation.x = 0.12;
        mainGroup.add(skullPivot);

        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const idleClip =
            gltf.animations.find((clip) => clip.name.toLowerCase() === 'idle') ||
            gltf.animations[0];
          if (idleClip) {
            const action = mixer.clipAction(idleClip);
            action.play();
          }
        }
      },
      undefined,
      (err) => {
        console.error('Failed to load wither skull model:', err);
      },
    );

    // 4. Animation Loop
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      if (!isSubscribed) return;
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (mixer) {
        mixer.update(delta);
      }

      // Subtle 3D floating & slight rotation around isometric angle
      mainGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.15;
      mainGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.04;

      renderer.render(scene, camera);
    });

    // 5. Cleanup
    return () => {
      isSubscribed = false;
      renderer.setAnimationLoop(null);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none flex size-full items-center justify-center ${className}`}
    />
  );
};

export default Minecraft3DSkullCanvas;
