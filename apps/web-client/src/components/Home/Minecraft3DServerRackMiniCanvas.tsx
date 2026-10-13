import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { loadRackModel, type ICubePrecise } from '../../services/serverRackModel';

function applyFaceUvs(
  uvAttr: THREE.BufferAttribute,
  offset: number,
  face: ICubePrecise['faces'][number],
  u1: number,
  v1: number,
  u2: number,
  v2: number,
): void {
  if (face.rotation === 90) {
    uvAttr.setXY(offset + 0, u1, 1 - v2);
    uvAttr.setXY(offset + 1, u2, 1 - v2);
    uvAttr.setXY(offset + 2, u1, 1 - v1);
    uvAttr.setXY(offset + 3, u2, 1 - v1);
  } else if (face.mc_face === 'north') {
    uvAttr.setXY(offset + 0, u2, 1 - v1);
    uvAttr.setXY(offset + 1, u1, 1 - v1);
    uvAttr.setXY(offset + 2, u2, 1 - v2);
    uvAttr.setXY(offset + 3, u1, 1 - v2);
  } else {
    uvAttr.setXY(offset + 0, u1, 1 - v1);
    uvAttr.setXY(offset + 1, u1, 1 - v2);
    uvAttr.setXY(offset + 2, u2, 1 - v1);
    uvAttr.setXY(offset + 3, u2, 1 - v2);
  }
}

function buildCubeMesh(
  cube: ICubePrecise,
  matMap: Record<string, THREE.Material>,
  invisibleMat: THREE.Material,
): THREE.Mesh {
  const [w, h, d] = cube.size;
  const [px, py, pz] = cube.position;

  const geo = new THREE.BoxGeometry(w, h, d);
  const faceMaterials: THREE.Material[] = [
    invisibleMat,
    invisibleMat,
    invisibleMat,
    invisibleMat,
    invisibleMat,
    invisibleMat,
  ];

  const uvAttr = geo.attributes.uv as THREE.BufferAttribute;

  for (const face of cube.faces) {
    const idx = face.three_idx;
    const texKey = face.texture;
    faceMaterials[idx] = matMap[texKey] || invisibleMat;

    if (texKey !== 'none') {
      const [u1, v1, u2, v2] = face.uv;
      const offset = idx * 4;
      applyFaceUvs(uvAttr, offset, face, u1, v1, u2, v2);
    }
  }

  uvAttr.needsUpdate = true;
  const mesh = new THREE.Mesh(geo, faceMaterials);
  mesh.position.set(px, py, pz);
  return mesh;
}

export const Minecraft3DServerRackMiniCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isSubscribed = true;

    // 1. Scene, Camera, Renderer for 48x48 Mini Icon
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(48, 48);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xe95420, 8, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // 3. Main Server Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const textureLoader = new THREE.TextureLoader();
    const onTexError = (err: unknown) => {
      console.error('Failed to load server rack texture:', err);
    };
    const caseTex = textureLoader.load(
      '/models/server_rack/case.png',
      (t: THREE.Texture) => {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.colorSpace = THREE.SRGBColorSpace;
      },
      undefined,
      onTexError,
    );
    const serverTex = textureLoader.load(
      '/models/server_rack/server.png',
      (t: THREE.Texture) => {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.colorSpace = THREE.SRGBColorSpace;
      },
      undefined,
      onTexError,
    );
    const lightsTex = textureLoader.load(
      '/models/server_rack/server_lights.png',
      (t: THREE.Texture) => {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
      },
      undefined,
      onTexError,
    );

    const invisibleMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const caseMat = new THREE.MeshStandardMaterial({
      map: caseTex,
      roughness: 0.5,
      metalness: 0.2,
    });
    const serverMat = new THREE.MeshStandardMaterial({
      map: serverTex,
      roughness: 0.4,
      metalness: 0.3,
    });
    const lightsMat = new THREE.MeshStandardMaterial({
      map: lightsTex,
      emissiveMap: lightsTex,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });

    const matMap: Record<string, THREE.Material> = {
      case: caseMat,
      server: serverMat,
      lights: lightsMat,
      none: invisibleMat,
    };

    loadRackModel()
      .then((data) => {
        if (!isSubscribed) return;

        const cubes: ICubePrecise[] = (data as { cubes?: ICubePrecise[] }).cubes || [];

        cubes.forEach((cube: ICubePrecise) => {
          mainGroup.add(buildCubeMesh(cube, matMap, invisibleMat));
        });

        mainGroup.scale.set(1.9, 1.9, 1.9);
        mainGroup.rotation.y = Math.PI - 0.35;
        mainGroup.rotation.x = 0.15;
      })
      .catch(() => {});

    // 4. Animation Loop
    const startTime = performance.now();
    let lastFrameTime = 0;
    let currentFrame = 0;

    renderer.setAnimationLoop(() => {
      if (!isSubscribed) return;

      const elapsedTime = (performance.now() - startTime) / 1000;

      // Keep model still facing front (no rotation)
      // Shift texture V offset by 16/128 (1/8) for LED blinking animation
      if (elapsedTime - lastFrameTime > 0.15) {
        currentFrame = (currentFrame + 1) % 8;
        lightsTex.offset.y = -(currentFrame * (16 / 128));
        lastFrameTime = elapsedTime;
      }

      renderer.render(scene, camera);
    });

    return () => {
      isSubscribed = false;
      renderer.setAnimationLoop(null);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none flex size-12 items-center justify-center"
    />
  );
};

export default Minecraft3DServerRackMiniCanvas;
