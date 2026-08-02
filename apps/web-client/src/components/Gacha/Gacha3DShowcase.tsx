import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  buildArcadeMachine,
  disposeArcadeMachine,
} from './buildArcadeMachine';
import {
  bindScreenReels,
  createScreenReels,
  type ScreenReelsController,
} from './screenReels';
import { reelsToImageStrips, type GachaSpinSync } from './gachaSpinSync';
import type { GachaReward, MappedGachaResult } from '../../pages/Gacha/types';
import '../../styles/widgets/gacha_3d_showcase.css';

interface Gacha3DShowcaseProps {
  tierId: string;
  tierColor: string;
  isOpening?: boolean;
  isCelebrating?: boolean;
  spinSync?: GachaSpinSync | null;
  reelItemsSet?: (GachaReward | MappedGachaResult)[][];
}

type EmissiveMat = THREE.MeshStandardMaterial & { userData: { baseEmissive?: number } };

const gltfBufferCache = new Map<string, Promise<ArrayBuffer>>();

function getGltfBuffer(tierId: string): Promise<ArrayBuffer> {
  if (!gltfBufferCache.has(tierId)) {
    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType('arraybuffer');
    const promise = fileLoader.loadAsync(`/models/gacha/cabinet_${tierId}.glb`) as Promise<ArrayBuffer>;
    gltfBufferCache.set(tierId, promise);
  }
  return gltfBufferCache.get(tierId)!;
}

// Prefetch all cabinet GLB models in background so machine switches are instant
['bronze', 'silver', 'gold', 'emerald', 'diamond', 'iridium', 'ultra'].forEach((tier) => {
  getGltfBuffer(tier).catch(() => {});
});

const Gacha3DShowcase: React.FC<Gacha3DShowcaseProps> = ({
  tierId,
  tierColor,
  isOpening = false,
  isCelebrating = false,
  spinSync = null,
  reelItemsSet = [[], [], []],
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const accentLightRef = useRef<THREE.PointLight | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const winActionRef = useRef<THREE.AnimationAction | null>(null);
  const screenReelsRef = useRef<ScreenReelsController | null>(null);
  const winLightsRef = useRef<THREE.Object3D | null>(null);
  const coinBadgeRef = useRef<THREE.Object3D | null>(null);
  const coinMatsRef = useRef<EmissiveMat[]>([]);
  const coinLightRef = useRef<THREE.PointLight | null>(null);
  const emissiveMatsRef = useRef<EmissiveMat[]>([]);
  const isOpeningRef = useRef(isOpening);
  const isCelebratingRef = useRef(isCelebrating);
  const prevTierRef = useRef(tierId);
  const stripsInitializedRef = useRef(false);
  const clockRef = useRef<THREE.Clock | null>(null);
  const fromGltfRef = useRef(false);

  useEffect(() => {
    isOpeningRef.current = isOpening;
  }, [isOpening]);

  useEffect(() => {
    if (!spinSync?.id) return;
    screenReelsRef.current?.playSpin(spinSync);
  }, [spinSync?.id, spinSync]);

  useEffect(() => {
    if (!reelItemsSet.every((col) => col.length > 0)) return;

    const tierChanged = prevTierRef.current !== tierId;
    prevTierRef.current = tierId;

    if (!tierChanged && stripsInitializedRef.current) return;

    stripsInitializedRef.current = true;
    screenReelsRef.current?.setStrips(reelsToImageStrips(reelItemsSet), { resetPosition: true });
  }, [tierId, reelItemsSet]);

  useEffect(() => {
    isCelebratingRef.current = isCelebrating;
    if (!isCelebrating) return;
    const action = winActionRef.current;
    if (!action) return;
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
  }, [isCelebrating]);

  useEffect(() => {
    if (accentLightRef.current) {
      accentLightRef.current.color.set(tierColor);
    }
    if (coinLightRef.current) {
      coinLightRef.current.color.set(tierColor);
    }
    for (const mat of coinMatsRef.current) {
      mat.emissive.set(tierColor);
    }
  }, [tierColor]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (!clockRef.current) {
      clockRef.current = new THREE.Clock();
    }

    const width = mount.clientWidth || 280;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(2.4, 0.55, 5.6);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.88));
    scene.add(new THREE.HemisphereLight(0xd8e8ff, 0x2a2420, 0.52));

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.55);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb8c8e8, 0.62);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd8b0, 0.38);
    rimLight.position.set(-1.5, 1.2, -3);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(tierColor, 1.25, 14);
    accentLight.position.set(1.5, 2.5, 3.5);
    accentLightRef.current = accentLight;
    scene.add(accentLight);

    const coinLight = new THREE.PointLight(tierColor, 0.32, 4.5);
    coinLight.position.set(0, 1.6, 1.4);
    coinLightRef.current = coinLight;
    scene.add(coinLight);

    const screenReels = createScreenReels(tierColor || '#5eead4');
    screenReelsRef.current = screenReels;

    let disposed = false;
    let frameId = 0;
    let idleAngle = 0;
    clockRef.current = new THREE.Clock();

    const prepareGltfMaterials = (root: THREE.Object3D) => {
      root.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = false;
        child.visible = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of materials) {
          if (!mat) continue;
          mat.side = THREE.DoubleSide;
          mat.visible = true;
          mat.transparent = false;
          mat.opacity = 1;
          mat.alphaTest = 0;
          mat.depthWrite = true;
          mat.depthTest = true;
          if ('alphaMap' in mat) mat.alphaMap = null;
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            mat.metalness = 0;
            mat.roughness = Math.min(Math.max(mat.roughness || 0.7, 0.42), 0.88);
            mat.color.set(0xffffff);
            if (mat.map) {
              mat.map.colorSpace = THREE.SRGBColorSpace;
              mat.map.premultiplyAlpha = false;
              mat.map.flipY = false;
              mat.map.needsUpdate = true;
            }
            if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            if (!mat.map && mat.color.getHex() === 0) {
              mat.color.set(tierColor || '#cd7f32');
            }

            const isVividPart = /marquee|mface|title|screen|led|btn|neon|fascia|accent|coin|rim|joy_t|waves/i.test(
              child.name
            );
            if (mat.map && isVividPart) {
              mat.emissiveMap = mat.map;
              mat.emissive.set(0xffffff);
              mat.emissiveIntensity = 0.24;
            } else if (mat.map) {
              mat.emissive.setHex(0x101820);
              mat.emissiveIntensity = 0.11;
            } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
            mat.envMapIntensity = 0;
            mat.needsUpdate = true;
          } else if (mat instanceof THREE.MeshBasicMaterial) {
            if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.needsUpdate = true;
          }
        }
      });
    };

    const fitAndFrame = (model: THREE.Object3D, targetSize = 3.35) => {
      model.scale.setScalar(1);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      model.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const dim = Math.max(size.x, size.y, size.z, 0.001);
      model.position.sub(center);
      model.scale.setScalar(targetSize / dim);
      model.updateMatrixWorld(true);

      const box2 = new THREE.Box3().setFromObject(model);
      const size2 = box2.getSize(new THREE.Vector3());
      const center2 = box2.getCenter(new THREE.Vector3());
      model.position.x -= center2.x;
      model.position.y -= center2.y;
      model.position.z -= center2.z;
      model.userData.baseY = model.position.y;

      const fitH = Math.max(size2.y, 0.001);
      const fitW = Math.max(size2.x, 0.001);
      const fov = camera.fov * (Math.PI / 180);
      const distForH = fitH / (2 * Math.tan(fov / 2));
      const distForW = fitW / (2 * Math.tan(fov / 2) * camera.aspect);
      const dist = Math.max(distForH, distForW) * 1.22;

      camera.near = 0.05;
      camera.far = Math.max(100, dist * 4);
      camera.position.set(dist * 0.28, fitH * 0.06, dist);
      camera.lookAt(0, fitH * 0.02, 0);
      camera.updateProjectionMatrix();
    };

    const releaseModel = (model: THREE.Group | null) => {
      if (!model) return;
      scene.remove(model);
      // GLTF resources may be loader-cached — disposing them blanks remounts (React Strict Mode).
      if (!model.userData.fromGltf) {
        disposeArcadeMachine(model);
      }
    };

    const cacheEmissive = (root: THREE.Object3D) => {
      const mats: EmissiveMat[] = [];
      root.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of materials) {
          if (!(m instanceof THREE.MeshStandardMaterial)) continue;
          if (m.emissiveIntensity <= 0.05 && m.emissive.getHex() === 0) continue;
          m.userData.baseEmissive = m.emissiveIntensity;
          mats.push(m as EmissiveMat);
        }
      });
      emissiveMatsRef.current = mats;
    };

    const bindWinLights = (root: THREE.Object3D, animations: THREE.AnimationClip[]) => {
      const winLights =
        root.getObjectByName('marquee_leds') ||
        root.getObjectByName('win_lights') ||
        null;
      winLightsRef.current = winLights;

      const coinBadge =
        root.getObjectByName('coin_badge') ||
        root.getObjectByName('badge') ||
        null;
      coinBadgeRef.current = coinBadge;

      const coinMats: EmissiveMat[] = [];
      const markCoinMat = (child: THREE.Object3D) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of materials) {
          if (!(m instanceof THREE.MeshStandardMaterial)) continue;
          if (m.map) m.emissiveMap = m.map;
          m.emissive = new THREE.Color(tierColor);
          m.userData.baseEmissive = 0.4;
          m.emissiveIntensity = 0.4;
          coinMats.push(m as EmissiveMat);
        }
      };
      if (coinBadge) {
        coinBadge.traverse(markCoinMat);
      } else {
        root.traverse((child) => {
          if (/badge|coin/i.test(child.name)) markCoinMat(child);
        });
      }
      coinMatsRef.current = coinMats;

      if (coinBadge && coinLightRef.current) {
        const world = new THREE.Vector3();
        coinBadge.getWorldPosition(world);
        coinLightRef.current.position.copy(world);
        coinLightRef.current.position.z += 0.6;
      }

      void screenReels.ready.then(() => {
        if (disposed) return;
        bindScreenReels(root, screenReels, tierColor || '#5eead4');
      });

      const clip = animations.find((c) => /win_flash/i.test(c.name)) || null;
      if (!clip) {
        mixerRef.current = null;
        winActionRef.current = null;
        return;
      }
      const mixer = new THREE.AnimationMixer(root);
      mixerRef.current = mixer;
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      winActionRef.current = action;
    };

    const mountModel = (model: THREE.Group, animations: THREE.AnimationClip[] = [], fromGltf = false) => {
      if (disposed) {
        if (!fromGltf) disposeArcadeMachine(model);
        return;
      }
      releaseModel(modelRef.current);
      model.userData.fromGltf = fromGltf;
      if (fromGltf) prepareGltfMaterials(model);
      fitAndFrame(model);
      cacheEmissive(model);
      bindWinLights(model, animations);
      modelRef.current = model;
      fromGltfRef.current = fromGltf;
      scene.add(model);
    };

    const loader = new GLTFLoader();

    // Fetch and parse GLTF directly from module cache.
    getGltfBuffer(tierId)
      .then(
        (buffer) =>
          new Promise<void>((resolve, reject) => {
            loader.parse(
              buffer,
              '/models/gacha/',
              (gltf) => {
                if (disposed) {
                  resolve();
                  return;
                }
                const root = gltf.scene;
                root.name = `arcade-gltf-${tierId}`;
                let meshCount = 0;
                root.traverse((c) => {
                  if (c instanceof THREE.Mesh) meshCount += 1;
                });
                if (meshCount === 0) {
                  reject(new Error('GLTF scene has no meshes'));
                  return;
                }
                mountModel(root, gltf.animations || [], true);
                resolve();
              },
              reject
            );
          })
      )
      .catch(() => {
        if (!disposed) {
          const procedural = buildArcadeMachine(tierId);
          mountModel(procedural, [], false);
        }
      });

    (window as unknown as { __gacha3d?: unknown }).__gacha3d = {
      scene,
      camera,
      renderer,
      getInfo: () => {
        const current = modelRef.current;
        if (!current) return { mounted: false };
        const box = new THREE.Box3().setFromObject(current);
        const size = box.getSize(new THREE.Vector3());
        let meshes = 0;
        let withMap = 0;
        let black = 0;
        current.traverse((c) => {
          if (!(c instanceof THREE.Mesh)) return;
          meshes += 1;
          const materials = Array.isArray(c.material) ? c.material : [c.material];
          for (const m of materials) {
            if (!m) continue;
            if ('map' in m && m.map) withMap += 1;
            if ('color' in m && m.color && (m.color as THREE.Color).getHex?.() === 0) black += 1;
          }
        });

        const corners = [
          new THREE.Vector3(box.min.x, box.min.y, box.min.z),
          new THREE.Vector3(box.min.x, box.min.y, box.max.z),
          new THREE.Vector3(box.min.x, box.max.y, box.min.z),
          new THREE.Vector3(box.min.x, box.max.y, box.max.z),
          new THREE.Vector3(box.max.x, box.min.y, box.min.z),
          new THREE.Vector3(box.max.x, box.min.y, box.max.z),
          new THREE.Vector3(box.max.x, box.max.y, box.min.z),
          new THREE.Vector3(box.max.x, box.max.y, box.max.z),
        ].map((v) => {
          const n = v.clone().project(camera);
          return {
            x: +((n.x * 0.5 + 0.5) * mount.clientWidth).toFixed(1),
            y: +((-n.y * 0.5 + 0.5) * mount.clientHeight).toFixed(1),
            z: +n.z.toFixed(3),
            clip: Math.abs(n.x) > 1 || Math.abs(n.y) > 1 || n.z > 1 || n.z < -1,
          };
        });
        const xs = corners.map((c) => c.x);
        const ys = corners.map((c) => c.y);
          return {
            mounted: true,
            fromGltf: !!current.userData.fromGltf,
            name: current.name,
            meshes,
            withMap,
            black,
            mats: (() => {
              const sample: Array<Record<string, unknown>> = [];
              current.traverse((c) => {
                if (!(c instanceof THREE.Mesh) || sample.length >= 6) return;
                const m = Array.isArray(c.material) ? c.material[0] : c.material;
                if (!(m instanceof THREE.MeshStandardMaterial)) return;
                sample.push({
                  mesh: c.name,
                  metalness: m.metalness,
                  roughness: m.roughness,
                  map: !!m.map,
                  mapW: m.map?.image?.width ?? null,
                  mapH: m.map?.image?.height ?? null,
                  color: `#${m.color.getHexString()}`,
                });
              });
              return sample;
            })(),
            size: { x: +size.x.toFixed(3), y: +size.y.toFixed(3), z: +size.z.toFixed(3) },
            pos: {
              x: +current.position.x.toFixed(3),
              y: +current.position.y.toFixed(3),
              z: +current.position.z.toFixed(3),
            },
            scale: +current.scale.x.toFixed(3),
            mount: {
              w: mount.clientWidth,
              h: mount.clientHeight,
            },
            cam: {
              x: +camera.position.x.toFixed(3),
              y: +camera.position.y.toFixed(3),
              z: +camera.position.z.toFixed(3),
              fov: camera.fov,
              aspect: +camera.aspect.toFixed(3),
            },
            projected: {
              minX: +Math.min(...xs).toFixed(1),
              maxX: +Math.max(...xs).toFixed(1),
              minY: +Math.min(...ys).toFixed(1),
              maxY: +Math.max(...ys).toFixed(1),
              fillW: +(((Math.max(...xs) - Math.min(...xs)) / mount.clientWidth) * 100).toFixed(1),
              fillH: +(((Math.max(...ys) - Math.min(...ys)) / mount.clientHeight) * 100).toFixed(1),
              corners,
            },
          };
      },
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!clockRef.current) clockRef.current = new THREE.Clock();
      const dt = clockRef.current.getDelta();
      if (mixerRef.current) mixerRef.current.update(dt);
      screenReelsRef.current?.update(dt);

      const current = modelRef.current;
      const celebrating = isCelebratingRef.current;
      const opening = isOpeningRef.current;

      if (current) {
        const baseY = typeof current.userData.baseY === 'number' ? current.userData.baseY : 0;
        idleAngle += celebrating ? 0.05 : opening ? 0.035 : 0.008;
        current.rotation.y = Math.sin(idleAngle) * (celebrating || opening ? 0.08 : 0.14);

        if (celebrating) {
          current.position.y = baseY + Math.sin(idleAngle * 3.2) * 0.05;
          accentLight.intensity = 1.35 + Math.sin(idleAngle * 10) * 0.55;
        } else if (opening) {
          current.position.y = baseY + Math.sin(idleAngle * 2.4) * 0.04;
          accentLight.intensity = 0.85 + Math.sin(idleAngle * 4) * 0.3;
        } else {
          current.position.y = baseY;
          accentLight.intensity = 1.05;
        }

        for (const mat of emissiveMatsRef.current) {
          const base = mat.userData.baseEmissive ?? 0.3;
          if (celebrating) {
            mat.emissiveIntensity = base * (2.2 + Math.sin(idleAngle * 12) * 1.4);
          } else if (opening) {
            mat.emissiveIntensity = base * (1.2 + Math.sin(idleAngle * 5) * 0.45);
          } else {
            mat.emissiveIntensity = base;
          }
        }

        for (const mat of coinMatsRef.current) {
          const base = mat.userData.baseEmissive ?? 0.35;
          if (celebrating) {
            mat.emissiveIntensity = base * (3.2 + Math.sin(idleAngle * 14) * 2.2);
          } else if (opening) {
            mat.emissiveIntensity = base * (1.8 + Math.sin(idleAngle * 7) * 0.9);
          } else {
            mat.emissiveIntensity = base * (1.15 + Math.sin(idleAngle * 2.2) * 0.45);
          }
        }

        if (coinLightRef.current) {
          if (celebrating) {
            coinLightRef.current.intensity = 0.75 + Math.sin(idleAngle * 14) * 0.45;
          } else if (opening) {
            coinLightRef.current.intensity = 0.45 + Math.sin(idleAngle * 6) * 0.2;
          } else {
            coinLightRef.current.intensity = 0.28 + Math.sin(idleAngle * 2.2) * 0.1;
          }
        }

        if (!winActionRef.current && winLightsRef.current && celebrating) {
          winLightsRef.current.children.forEach((child, i) => {
            const pulse = 0.85 + Math.abs(Math.sin(idleAngle * 8 - i * 0.45)) * 0.7;
            child.scale.setScalar(pulse);
          });
        } else if (!winActionRef.current && winLightsRef.current && !celebrating) {
          winLightsRef.current.children.forEach((child) => {
            child.scale.setScalar(0.85);
          });
        }

        if (!winActionRef.current && coinBadgeRef.current) {
          const pulse = celebrating
            ? 1 + Math.abs(Math.sin(idleAngle * 10)) * 0.22
            : 1 + Math.sin(idleAngle * 2.4) * 0.04;
          coinBadgeRef.current.scale.setScalar(pulse);
        }

        const stick = current.getObjectByName('joystick-stick');
        if (stick) {
          stick.rotation.z = Math.sin(idleAngle * 1.6) * 0.18;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 280;
      const h = mount.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      const dbg = window as unknown as { __gacha3d?: unknown };
      if (dbg.__gacha3d) delete dbg.__gacha3d;
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
      winActionRef.current = null;
      screenReelsRef.current?.dispose();
      screenReelsRef.current = null;
      winLightsRef.current = null;
      coinBadgeRef.current = null;
      coinMatsRef.current = [];
      emissiveMatsRef.current = [];
      if (coinLightRef.current) {
        scene.remove(coinLightRef.current);
        coinLightRef.current = null;
      }
      releaseModel(modelRef.current);
      modelRef.current = null;
      accentLightRef.current = null;
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [tierId, tierColor]);

  return (
    <div
      className={`gacha-3d-showcase ${isOpening ? 'is-spinning' : ''} ${isCelebrating ? 'is-celebrating' : ''}`}
      style={{ '--tier-color': tierColor } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="showcase-pedestal">
        <div className="pedestal-top" />
        <div className="pedestal-glow" />
      </div>
      <div ref={mountRef} className="three-container" />
      <span className="showcase-caption">{tierId} cabinet</span>
    </div>
  );
};

export default Gacha3DShowcase;
