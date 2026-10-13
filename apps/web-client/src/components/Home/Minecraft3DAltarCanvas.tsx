import { secureRandom } from '../../utils/random';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const STAFF_MEMBERS = {
  KILLUBY: 'KillubysmaliVT',
  NEROFERNO: 'Neroferno ultranix',
  XURLITO: 'Xurlito',
  JAPA: 'JAPA325',
} as const;

const STAFF_RAY_NAMES = [
  STAFF_MEMBERS.KILLUBY,
  STAFF_MEMBERS.NEROFERNO,
  STAFF_MEMBERS.XURLITO,
  STAFF_MEMBERS.JAPA,
] as const;

const STAFF_COLOR_PALETTES: Record<string, { primary: string; secondary: string }> = {
  [STAFF_MEMBERS.KILLUBY]: { primary: '#00637c', secondary: '#5eead4' },
  [STAFF_MEMBERS.NEROFERNO]: { primary: '#ff00b7', secondary: '#e879f9' },
  [STAFF_MEMBERS.XURLITO]: { primary: '#00aeef', secondary: '#38bdf8' },
  [STAFF_MEMBERS.JAPA]: { primary: '#1d4ed8', secondary: '#60a5fa' },
};

const STATIC_STAFF_CARD_ANCHORS: Record<string, THREE.Vector3> = {
  [STAFF_MEMBERS.KILLUBY]: new THREE.Vector3(-2.1, -1.05, 0.1),
  [STAFF_MEMBERS.NEROFERNO]: new THREE.Vector3(-0.7, -1.05, 0.1),
  [STAFF_MEMBERS.XURLITO]: new THREE.Vector3(0.7, -1.05, 0.1),
  [STAFF_MEMBERS.JAPA]: new THREE.Vector3(2.1, -1.05, 0.1),
};

const TEXTURE_PATHS = {
  NETHERITE: '/images/items/Block_of_Netherite_JE1_BE1.webp',
  EMERALD: '/images/items/Emerald_JE3_BE3.png',
  GLASS: '/images/glass.png?v=2',
  OBSIDIAN: '/images/obsidian.png?v=2',
  BEACON: '/images/beacon.png',
  NETHER_STAR: '/images/items/Nether_Star.gif',
  BEACON_BEAM: '/images/Beacon_Beam_(texture).png',
  TORO_WITHER_MODEL: '/models/toro_wither.gltf',
} as const;

const SPARK_PALETTE_HEX = ['#00637c', '#ff00b7', '#00aeef', '#10b981', '#ffffff'] as const;
const EXP_SPARK_COUNT = 120;
const LIGHTNING_SEGMENTS = 32;
const EMPTY_MEMBERS: string[] = [];

interface Minecraft3DAltarCanvasProps {
  stageId: number;
  accentColor?: string;
  activeStaffColor?: string | null;
  linkedMembersList?: string[];
  dragActiveMember?: string | null;
  cursorPos?: { x: number; y: number } | null;
}

interface RayEntry {
  coreMesh: THREE.Mesh;
  coreMat: THREE.MeshBasicMaterial;
  auraMesh: THREE.Mesh;
  auraMat: THREE.MeshBasicMaterial;
}

interface BeaconStageElements {
  activeBeamTexture: THREE.Texture;
  activeBeamCoreMesh: THREE.Mesh;
  activeBeamAuraMesh: THREE.Mesh;
  activeBeaconCore: THREE.Mesh;
  fullStarMat: THREE.MeshBasicMaterial;
  starShards: THREE.Mesh[];
  starShardMats: THREE.MeshBasicMaterial[];
  shockwaveMesh: THREE.Mesh;
  expPoints: THREE.Points;
  expVelArr: THREE.Vector3[];
  staff3DRaysDict: Record<string, RayEntry>;
}

interface RenderContext {
  container: HTMLDivElement;
  camera: THREE.PerspectiveCamera;
  pointLight1: THREE.PointLight;
  particleMat: THREE.PointsMaterial;
  accentColor: string;
  activeStaffColorRef: React.RefObject<string | null>;
  linkedMembersRef: React.RefObject<string[]>;
  dragActiveMemberRef: React.RefObject<string | null>;
  cursorPosRef: React.RefObject<{ x: number; y: number } | null>;
  flareTimerRef: React.RefObject<number>;
  flaringColorRef: React.RefObject<string | null>;
  hasExplodedRef: React.RefObject<boolean>;
  explosionTimerRef: React.RefObject<number>;
  explosionDelayTimerRef: React.RefObject<number>;
}

function createSoftGlowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function setupLighting(scene: THREE.Scene, stageColor: THREE.Color): THREE.PointLight {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(stageColor, 6, 15);
  pointLight1.position.set(3, 3, 4);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff4444, 4, 15);
  pointLight2.position.set(-3, -3, 3);
  scene.add(pointLight2);

  return pointLight1;
}

function filterWitherMaterials(child: THREE.Mesh): void {
  const name = (child.name || '').toLowerCase();
  const isHitbox =
    name.includes('hitbox') || name.includes('collider') || name.includes('bounding');
  const mats = (
    Array.isArray(child.material) ? child.material : [child.material]
  ) as (THREE.Material & { map?: THREE.Texture | null })[];
  const hasTexture = mats.some((m) => Boolean(m?.map));

  if (isHitbox || !hasTexture) {
    child.visible = false;
    return;
  }

  child.visible = true;
  mats.forEach((mat) => {
    if (mat?.map) {
      mat.map.magFilter = THREE.NearestFilter;
      mat.map.minFilter = THREE.NearestFilter;
    }
    mat.side = THREE.DoubleSide;
    mat.transparent = true;
    mat.alphaTest = 0.05;
  });
}

function setupWitherStage(
  mainGroup: THREE.Group,
  isSubscribed: () => boolean,
  onMixerCreated: (mixer: THREE.AnimationMixer) => void,
): void {
  const loader = new GLTFLoader();
  loader.load(
    TEXTURE_PATHS.TORO_WITHER_MODEL,
    (gltf) => {
      if (!isSubscribed()) return;

      const model = gltf.scene;
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          filterWitherMaterials(child);
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 3.2 / maxDim;

      model.scale.set(scale, scale, scale);
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      const witherPivot = new THREE.Group();
      witherPivot.add(model);
      witherPivot.rotation.y = Math.PI;
      mainGroup.add(witherPivot);

      if (gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        const idleClip =
          gltf.animations.find((clip) => clip.name.toLowerCase() === 'idle') || gltf.animations[0];
        if (idleClip) {
          const action = mixer.clipAction(idleClip);
          action.play();
        }
        onMixerCreated(mixer);
      }
    },
    undefined,
    (err) => console.error('Failed to load 3D model/texture:', err),
  );
}

function createBeaconStructure(
  beaconGroup: THREE.Group,
  textureLoader: THREE.TextureLoader,
): THREE.Mesh {
  const glassTexture = textureLoader.load(TEXTURE_PATHS.GLASS);
  glassTexture.magFilter = THREE.NearestFilter;
  glassTexture.minFilter = THREE.NearestFilter;

  const glassGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
  const glassMat = new THREE.MeshStandardMaterial({
    map: glassTexture,
    transparent: true,
    alphaTest: 0.05,
    roughness: 0.1,
    side: THREE.DoubleSide,
  });
  beaconGroup.add(new THREE.Mesh(glassGeo, glassMat));

  const obsTexture = textureLoader.load(TEXTURE_PATHS.OBSIDIAN);
  obsTexture.magFilter = THREE.NearestFilter;
  obsTexture.minFilter = THREE.NearestFilter;
  obsTexture.wrapS = THREE.RepeatWrapping;
  obsTexture.wrapT = THREE.RepeatWrapping;
  obsTexture.repeat.set(1, 0.1875);
  obsTexture.offset.set(0, 0.8125);

  const obsGeo = new THREE.BoxGeometry(1.05, 0.25, 1.05);
  const obsMat = new THREE.MeshStandardMaterial({
    map: obsTexture,
    roughness: 0.8,
    metalness: 0.1,
  });
  const obsMesh = new THREE.Mesh(obsGeo, obsMat);
  obsMesh.position.set(0, -0.575, 0);
  beaconGroup.add(obsMesh);

  const beaconCoreTexture = textureLoader.load(TEXTURE_PATHS.BEACON);
  beaconCoreTexture.magFilter = THREE.NearestFilter;
  beaconCoreTexture.minFilter = THREE.NearestFilter;

  const beaconCoreGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
  const beaconCoreMat = new THREE.MeshStandardMaterial({
    map: beaconCoreTexture,
    color: 0xffffff,
    roughness: 0.1,
    side: THREE.DoubleSide,
  });
  const activeBeaconCore = new THREE.Mesh(beaconCoreGeo, beaconCoreMat);
  activeBeaconCore.position.set(0, -0.025, 0);

  const coreHotGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
  const coreHotMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });
  activeBeaconCore.add(new THREE.Mesh(coreHotGeo, coreHotMat));
  beaconGroup.add(activeBeaconCore);

  return activeBeaconCore;
}

function createNetherStarDisplay(textureLoader: THREE.TextureLoader): {
  group: THREE.Group;
  fullStarMat: THREE.MeshBasicMaterial;
  starShards: THREE.Mesh[];
  starShardMats: THREE.MeshBasicMaterial[];
} {
  const netherStarTexture = textureLoader.load(TEXTURE_PATHS.NETHER_STAR);
  netherStarTexture.magFilter = THREE.NearestFilter;
  netherStarTexture.minFilter = THREE.NearestFilter;

  const group = new THREE.Group();
  const fullStarGeo = new THREE.PlaneGeometry(0.65, 0.65);
  const fullStarMat = new THREE.MeshBasicMaterial({
    map: netherStarTexture,
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
    opacity: 1.0,
  });
  const fullStar1 = new THREE.Mesh(fullStarGeo, fullStarMat);
  const fullStar2 = new THREE.Mesh(fullStarGeo, fullStarMat);
  fullStar2.rotation.y = Math.PI / 2;
  group.add(fullStar1, fullStar2);

  const shardUVs = [
    [0, 0.5, 0.5, 1.0],
    [0.5, 1.0, 0.5, 1.0],
    [0, 0.5, 0, 0.5],
    [0.5, 1.0, 0, 0.5],
  ];
  const shardOffsets = [
    { x: -0.16, y: 0.16 },
    { x: 0.16, y: 0.16 },
    { x: -0.16, y: -0.16 },
    { x: 0.16, y: -0.16 },
  ];

  const starShards: THREE.Mesh[] = [];
  const starShardMats: THREE.MeshBasicMaterial[] = [];

  for (let s = 0; s < 4; s++) {
    const sGeo = new THREE.PlaneGeometry(0.35, 0.35);
    const u = shardUVs[s];
    const uvAttr = sGeo.attributes.uv;
    uvAttr.setXY(0, u[0], u[3]);
    uvAttr.setXY(1, u[1], u[3]);
    uvAttr.setXY(2, u[0], u[2]);
    uvAttr.setXY(3, u[1], u[2]);

    const sMat = new THREE.MeshBasicMaterial({
      map: netherStarTexture,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const sMesh = new THREE.Mesh(sGeo, sMat);
    sMesh.position.set(shardOffsets[s].x, shardOffsets[s].y, 0);

    const sMeshCross = new THREE.Mesh(sGeo, sMat);
    sMeshCross.rotation.y = Math.PI / 2;
    sMesh.add(sMeshCross);

    starShards.push(sMesh);
    starShardMats.push(sMat);
    group.add(sMesh);
  }

  group.position.set(0, -0.05, 0.1);
  return { group, fullStarMat, starShards, starShardMats };
}

function createShockwaveAndSparks(): {
  shockwaveMesh: THREE.Mesh;
  expPoints: THREE.Points;
  expVelArr: THREE.Vector3[];
} {
  const shockwaveGeo = new THREE.RingGeometry(0.1, 0.4, 32);
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
  shockwaveMesh.position.set(0, -0.05, 0.11);

  const expPosArr = new Float32Array(EXP_SPARK_COUNT * 3);
  const expColArr = new Float32Array(EXP_SPARK_COUNT * 3);
  const sparkPaletteColors = SPARK_PALETTE_HEX.map((hex) => new THREE.Color(hex));
  const expVelArr: THREE.Vector3[] = [];

  for (let e = 0; e < EXP_SPARK_COUNT; e++) {
    expPosArr[e * 3] = 0;
    expPosArr[e * 3 + 1] = -0.05;
    expPosArr[e * 3 + 2] = 0.1;

    const theta = secureRandom() * Math.PI * 2;
    const phi = (secureRandom() - 0.5) * Math.PI;
    const speed = 1.5 + secureRandom() * 3.5;

    expVelArr.push(
      new THREE.Vector3(
        Math.cos(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * speed,
        Math.cos(phi) * Math.sin(theta) * speed,
      ),
    );

    const col = sparkPaletteColors[e % sparkPaletteColors.length];
    expColArr[e * 3] = col.r;
    expColArr[e * 3 + 1] = col.g;
    expColArr[e * 3 + 2] = col.b;
  }

  const expGeo = new THREE.BufferGeometry();
  expGeo.setAttribute('position', new THREE.BufferAttribute(expPosArr, 3));
  expGeo.setAttribute('color', new THREE.BufferAttribute(expColArr, 3));

  const expMat = new THREE.PointsMaterial({
    map: createSoftGlowParticleTexture(),
    vertexColors: true,
    size: 0.28,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const expPoints = new THREE.Points(expGeo, expMat);

  return { shockwaveMesh, expPoints, expVelArr };
}

function createBeaconBeam(
  beaconGroup: THREE.Group,
  textureLoader: THREE.TextureLoader,
  stageColor: THREE.Color,
): {
  beamTexture: THREE.Texture;
  beamCoreMesh: THREE.Mesh;
  beamAuraMesh: THREE.Mesh;
} {
  const beamTexture = textureLoader.load(TEXTURE_PATHS.BEACON_BEAM);
  beamTexture.wrapS = THREE.RepeatWrapping;
  beamTexture.wrapT = THREE.RepeatWrapping;
  beamTexture.repeat.set(1, 8);
  beamTexture.magFilter = THREE.NearestFilter;
  beamTexture.minFilter = THREE.NearestFilter;

  const beamCoreGeo = new THREE.BoxGeometry(0.3, 20, 0.3);
  beamCoreGeo.translate(0, 10, 0);
  const beamCoreMat = new THREE.MeshBasicMaterial({
    map: beamTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const beamCoreMesh = new THREE.Mesh(beamCoreGeo, beamCoreMat);

  const beamAuraGeo = new THREE.BoxGeometry(0.46, 20, 0.46);
  beamAuraGeo.translate(0, 10, 0);
  const beamAuraMat = new THREE.MeshBasicMaterial({
    map: beamTexture,
    color: stageColor,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beamAuraMesh = new THREE.Mesh(beamAuraGeo, beamAuraMat);

  beaconGroup.add(beamCoreMesh, beamAuraMesh);
  return { beamTexture, beamCoreMesh, beamAuraMesh };
}

function createLightningRayEntry(
  mainGroup: THREE.Group,
  numVerts: number,
  indices: number[],
): RayEntry {
  const createRayMesh = (renderOrder: number) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(numVerts * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(numVerts * 3), 3));
    geo.setIndex(indices);

    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = renderOrder;
    mainGroup.add(mesh);
    return { mesh, mat };
  };

  const core = createRayMesh(999);
  const aura = createRayMesh(998);

  return {
    coreMesh: core.mesh,
    coreMat: core.mat,
    auraMesh: aura.mesh,
    auraMat: aura.mat,
  };
}

function setupBeaconStage(
  mainGroup: THREE.Group,
  textureLoader: THREE.TextureLoader,
  stageColor: THREE.Color,
): BeaconStageElements {
  const beaconGroup = new THREE.Group();
  beaconGroup.position.set(0, 0, -1.2);
  mainGroup.add(beaconGroup);

  const activeBeaconCore = createBeaconStructure(beaconGroup, textureLoader);
  const starDisplay = createNetherStarDisplay(textureLoader);
  mainGroup.add(starDisplay.group);

  const { shockwaveMesh, expPoints, expVelArr } = createShockwaveAndSparks();
  mainGroup.add(shockwaveMesh, expPoints);

  const { beamTexture, beamCoreMesh, beamAuraMesh } = createBeaconBeam(
    beaconGroup,
    textureLoader,
    stageColor,
  );

  const numVerts = (LIGHTNING_SEGMENTS + 1) * 2;
  const indices: number[] = [];
  for (let i = 0; i < LIGHTNING_SEGMENTS; i++) {
    const row1 = i * 2;
    const row2 = (i + 1) * 2;
    indices.push(row1, row1 + 1, row2, row1 + 1, row2 + 1, row2);
  }

  const staff3DRaysDict: Record<string, RayEntry> = {};
  STAFF_RAY_NAMES.forEach((name) => {
    staff3DRaysDict[name] = createLightningRayEntry(mainGroup, numVerts, indices);
  });

  return {
    activeBeamTexture: beamTexture,
    activeBeamCoreMesh: beamCoreMesh,
    activeBeamAuraMesh: beamAuraMesh,
    activeBeaconCore,
    fullStarMat: starDisplay.fullStarMat,
    starShards: starDisplay.starShards,
    starShardMats: starDisplay.starShardMats,
    shockwaveMesh,
    expPoints,
    expVelArr,
    staff3DRaysDict,
  };
}

function setupBlockStage(
  stageId: number,
  mainGroup: THREE.Group,
  textureLoader: THREE.TextureLoader,
  stageColor: THREE.Color,
): void {
  const textureUrl = stageId === 1 ? TEXTURE_PATHS.EMERALD : TEXTURE_PATHS.NETHERITE;
  const mcTexture = textureLoader.load(textureUrl);
  mcTexture.magFilter = THREE.NearestFilter;
  mcTexture.minFilter = THREE.NearestFilter;

  const blockGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
  const blockMat = new THREE.MeshStandardMaterial({
    map: mcTexture,
    roughness: 0.2,
    metalness: stageId === 4 ? 0.8 : 0.1,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide,
  });
  const blockMesh = new THREE.Mesh(blockGeo, blockMat);
  mainGroup.add(blockMesh);

  const wireframeGeo = new THREE.WireframeGeometry(blockGeo);
  const wireframeMat = new THREE.LineBasicMaterial({
    color: stageColor,
    transparent: true,
    opacity: 0.4,
  });
  blockMesh.add(new THREE.LineSegments(wireframeGeo, wireframeMat));

  const innerGeo = new THREE.BoxGeometry(0.875, 0.875, 0.875);
  const innerMat = new THREE.MeshStandardMaterial({
    map: mcTexture,
    color: stageColor,
    emissive: stageColor,
    emissiveIntensity: 0.7,
    roughness: 0.1,
  });
  mainGroup.add(new THREE.Mesh(innerGeo, innerMat));
}

function setupAmbientParticles(
  scene: THREE.Scene,
  stageColor: THREE.Color,
): {
  particles: THREE.Points;
  particleGeo: THREE.BufferGeometry;
  particleMat: THREE.PointsMaterial;
} {
  const particleCount = 80;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 1.4 + secureRandom() * 1.5;
    const theta = secureRandom() * Math.PI * 2;
    const phi = Math.acos(secureRandom() * 2 - 1);

    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    map: createSoftGlowParticleTexture(),
    color: stageColor,
    size: 0.25,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  return { particles, particleGeo, particleMat };
}

function updateExplosionAnimation(
  beacon: BeaconStageElements,
  delta: number,
  explosionTimerRef: React.RefObject<number>,
): void {
  explosionTimerRef.current -= delta;
  const progress = (1.6 - explosionTimerRef.current) / 1.6;

  const swScale = 0.2 + progress * 6.5;
  beacon.shockwaveMesh.scale.set(swScale, swScale, swScale);
  (beacon.shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
    0,
    1.0 - progress * 1.2,
  );

  (beacon.expPoints.material as THREE.PointsMaterial).opacity = Math.max(0, 1.0 - progress);
  const pArr = beacon.expPoints.geometry.attributes.position.array as Float32Array;
  for (let e = 0; e < EXP_SPARK_COUNT; e++) {
    const vel = beacon.expVelArr[e];
    pArr[e * 3] += vel.x * delta * 2.2;
    pArr[e * 3 + 1] += vel.y * delta * 2.2;
    pArr[e * 3 + 2] += vel.z * delta * 2.2;
  }
  beacon.expPoints.geometry.attributes.position.needsUpdate = true;
  beacon.fullStarMat.opacity = 0;

  const baseOffsets = [
    { x: -0.16, y: 0.16, dx: -1.5, dy: 1.5 },
    { x: 0.16, y: 0.16, dx: 1.5, dy: 1.5 },
    { x: -0.16, y: -0.16, dx: -1.5, dy: -1.5 },
    { x: 0.16, y: -0.16, dx: 1.5, dy: -1.5 },
  ];

  beacon.starShards.forEach((shard, s) => {
    const bo = baseOffsets[s];
    shard.position.x = bo.x + bo.dx * progress * 1.8;
    shard.position.y = bo.y + bo.dy * progress * 1.8;
    shard.position.z = progress * 0.8;
    shard.rotation.z = progress * 7.0 * (s % 2 === 0 ? 1 : -1);

    if (beacon.starShardMats[s]) {
      beacon.starShardMats[s].opacity = Math.max(0, 1.0 - progress * 1.25);
    }
  });
}

function updateExplosionOrStarRest(
  beacon: BeaconStageElements,
  delta: number,
  isFullyLinked: boolean,
  ctx: RenderContext,
): void {
  if (ctx.explosionTimerRef.current > 0) {
    updateExplosionAnimation(beacon, delta, ctx.explosionTimerRef);
    return;
  }

  beacon.fullStarMat.opacity = isFullyLinked ? 0 : 1.0;
  beacon.starShardMats.forEach((mat) => {
    mat.opacity = 0;
  });

  (beacon.shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = 0;
  (beacon.expPoints.material as THREE.PointsMaterial).opacity = 0;
}

function resolveTargetPos(
  ctx: RenderContext,
  targetPos: THREE.Vector3,
  isDragging: boolean,
  rayVector: THREE.Vector3,
): void {
  targetPos.set(0, -0.05, 0.1);
  if (!isDragging || !ctx.cursorPosRef.current) return;

  const rect = ctx.container.getBoundingClientRect();
  const ndcX = (ctx.cursorPosRef.current.x / rect.width) * 2 - 1;
  const ndcY = -(ctx.cursorPosRef.current.y / rect.height) * 2 + 1;

  rayVector.set(ndcX, ndcY, 0.5);
  rayVector.unproject(ctx.camera);

  const dir = rayVector.sub(ctx.camera.position).normalize();
  const distanceToPlane = (0.1 - ctx.camera.position.z) / dir.z;
  targetPos.copy(ctx.camera.position).add(dir.multiplyScalar(distanceToPlane));
}

interface ArcCalcParams {
  startAnchor: THREE.Vector3;
  deltaVec: THREE.Vector3;
  sideVec: THREE.Vector3;
  colorA: THREE.Color;
  colorB: THREE.Color;
  vCol: THREE.Color;
  elapsedTime: number;
}

function writeArcGeometryBuffers(rayEntry: RayEntry, params: ArcCalcParams): void {
  const { startAnchor, deltaVec, sideVec, colorA, colorB, vCol, elapsedTime } = params;
  const corePosArr = (rayEntry.coreMesh.geometry.attributes.position as THREE.BufferAttribute)
    .array as Float32Array;
  const coreColArr = (rayEntry.coreMesh.geometry.attributes.color as THREE.BufferAttribute)
    .array as Float32Array;
  const auraPosArr = (rayEntry.auraMesh.geometry.attributes.position as THREE.BufferAttribute)
    .array as Float32Array;
  const auraColArr = (rayEntry.auraMesh.geometry.attributes.color as THREE.BufferAttribute)
    .array as Float32Array;

  for (let i = 0; i <= LIGHTNING_SEGMENTS; i++) {
    const t = i / LIGHTNING_SEGMENTS;
    const envelope = Math.sin(t * Math.PI);

    let jx = 0;
    let jy = 0;
    let jz = 0;
    if (i > 0 && i < LIGHTNING_SEGMENTS) {
      jx = (Math.sin(elapsedTime * 28 + i * 1.7) * 0.12 + (secureRandom() - 0.5) * 0.14) * envelope;
      jy = (Math.cos(elapsedTime * 22 + i * 2.1) * 0.12 + (secureRandom() - 0.5) * 0.14) * envelope;
      jz = (Math.sin(elapsedTime * 19 + i * 1.3) * 0.08 + (secureRandom() - 0.5) * 0.1) * envelope;
    }

    const px = startAnchor.x + deltaVec.x * t + jx;
    const py = startAnchor.y + deltaVec.y * t + jy;
    const pz = startAnchor.z + deltaVec.z * t + jz;

    const coreHalfW = 0.02 * envelope + 0.012;
    corePosArr[i * 6] = px - sideVec.x * coreHalfW;
    corePosArr[i * 6 + 1] = py - sideVec.y * coreHalfW;
    corePosArr[i * 6 + 2] = pz - sideVec.z * coreHalfW;
    corePosArr[i * 6 + 3] = px + sideVec.x * coreHalfW;
    corePosArr[i * 6 + 4] = py + sideVec.y * coreHalfW;
    corePosArr[i * 6 + 5] = pz + sideVec.z * coreHalfW;

    const auraHalfW = 0.08 * envelope + 0.035;
    auraPosArr[i * 6] = px - sideVec.x * auraHalfW;
    auraPosArr[i * 6 + 1] = py - sideVec.y * auraHalfW;
    auraPosArr[i * 6 + 2] = pz - sideVec.z * auraHalfW;
    auraPosArr[i * 6 + 3] = px + sideVec.x * auraHalfW;
    auraPosArr[i * 6 + 4] = py + sideVec.y * auraHalfW;
    auraPosArr[i * 6 + 5] = pz + sideVec.z * auraHalfW;

    vCol.copy(colorA).lerp(colorB, t);

    coreColArr[i * 6] = 1.0;
    coreColArr[i * 6 + 1] = 1.0;
    coreColArr[i * 6 + 2] = 1.0;
    coreColArr[i * 6 + 3] = 1.0;
    coreColArr[i * 6 + 4] = 1.0;
    coreColArr[i * 6 + 5] = 1.0;

    auraColArr[i * 6] = vCol.r;
    auraColArr[i * 6 + 1] = vCol.g;
    auraColArr[i * 6 + 2] = vCol.b;
    auraColArr[i * 6 + 3] = vCol.r;
    auraColArr[i * 6 + 4] = vCol.g;
    auraColArr[i * 6 + 5] = vCol.b;
  }

  (rayEntry.coreMesh.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  (rayEntry.coreMesh.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  (rayEntry.auraMesh.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  (rayEntry.auraMesh.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
}

function updateSingleLightningRay(
  name: string,
  rayEntry: RayEntry,
  ctx: RenderContext,
  isFullyLinked: boolean,
  elapsedTime: number,
  reusables: {
    targetPos: THREE.Vector3;
    rayVec: THREE.Vector3;
    deltaVec: THREE.Vector3;
    upVec: THREE.Vector3;
    sideVec: THREE.Vector3;
    defaultAnchor: THREE.Vector3;
    colorA: THREE.Color;
    colorB: THREE.Color;
    targetColor: THREE.Color;
    whiteColor: THREE.Color;
    vCol: THREE.Color;
  },
): void {
  const isLinked = ctx.linkedMembersRef.current.includes(name);
  const isDragging = ctx.dragActiveMemberRef.current === name;
  const raysShouldDisappear = isFullyLinked && ctx.hasExplodedRef.current;

  if ((!isLinked && !isDragging) || raysShouldDisappear) {
    rayEntry.coreMat.opacity = 0;
    rayEntry.auraMat.opacity = 0;
    return;
  }

  rayEntry.coreMat.opacity = 0.98;
  rayEntry.auraMat.opacity = 0.75;

  resolveTargetPos(ctx, reusables.targetPos, isDragging, reusables.rayVec);

  const startAnchor = STATIC_STAFF_CARD_ANCHORS[name] || reusables.defaultAnchor;
  reusables.deltaVec.subVectors(reusables.targetPos, startAnchor);
  reusables.sideVec.crossVectors(reusables.deltaVec, reusables.upVec).normalize();
  if (reusables.sideVec.lengthSq() < 0.001) {
    reusables.sideVec.set(1, 0, 0);
  }

  const palette = STAFF_COLOR_PALETTES[name];
  const colorA = palette ? reusables.colorA.set(palette.primary) : reusables.targetColor;
  const colorB = palette ? reusables.colorB.set(palette.secondary) : reusables.whiteColor;

  writeArcGeometryBuffers(rayEntry, {
    startAnchor,
    deltaVec: reusables.deltaVec,
    sideVec: reusables.sideVec,
    colorA,
    colorB,
    vCol: reusables.vCol,
    elapsedTime,
  });
}

function updateBeaconBeamAnimation(
  beacon: BeaconStageElements,
  delta: number,
  isFullyLinked: boolean,
  isFlaring: boolean,
  dragActiveMember: string | null,
): void {
  beacon.activeBeamCoreMesh.rotation.y += delta * 1.5;
  beacon.activeBeamAuraMesh.rotation.y -= delta * 0.9;
  beacon.activeBeamTexture.offset.y -= delta * 2.5;

  let targetCoreOpacity = 0;
  let targetAuraOpacity = 0;

  if (isFullyLinked) {
    targetCoreOpacity = 0.95;
    targetAuraOpacity = 0.6;
  } else if (isFlaring || dragActiveMember) {
    targetCoreOpacity = 0.85;
    targetAuraOpacity = 0.5;
  }

  const coreMat = beacon.activeBeamCoreMesh.material as THREE.MeshBasicMaterial;
  const auraMat = beacon.activeBeamAuraMesh.material as THREE.MeshBasicMaterial;
  coreMat.opacity = THREE.MathUtils.lerp(coreMat.opacity, targetCoreOpacity, 0.1);
  auraMat.opacity = THREE.MathUtils.lerp(auraMat.opacity, targetAuraOpacity, 0.1);
}

function resolveBeaconTargetColorHex(
  isFlaring: boolean,
  flaringColor: string | null,
  dragActiveMember: string | null,
  activeStaffColor: string | null,
  accentColor: string,
): string {
  if (isFlaring && flaringColor) return flaringColor;
  if (dragActiveMember && activeStaffColor) return activeStaffColor;
  return accentColor;
}

export const Minecraft3DAltarCanvas: React.FC<Readonly<Minecraft3DAltarCanvasProps>> = ({
  stageId,
  accentColor = '#89d9d1',
  activeStaffColor = null,
  linkedMembersList = EMPTY_MEMBERS,
  dragActiveMember = null,
  cursorPos = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStaffColorRef = useRef<string | null>(activeStaffColor);
  const linkedMembersRef = useRef<string[]>(linkedMembersList);
  const dragActiveMemberRef = useRef<string | null>(dragActiveMember);
  const cursorPosRef = useRef<{ x: number; y: number } | null>(cursorPos);
  const prevLinkedMembersRef = useRef<string[]>([]);
  const flareTimerRef = useRef<number>(0);
  const flaringColorRef = useRef<string | null>(null);
  const hasExplodedRef = useRef<boolean>(false);
  const explosionTimerRef = useRef<number>(0);
  const explosionDelayTimerRef = useRef<number>(0.4);

  useEffect(() => {
    activeStaffColorRef.current = activeStaffColor;
  }, [activeStaffColor]);

  useEffect(() => {
    const prevList = prevLinkedMembersRef.current;
    if (linkedMembersList.length > prevList.length) {
      const prevSet = new Set(prevList);
      const newlyLinked = linkedMembersList.find((m) => !prevSet.has(m));
      if (newlyLinked && STAFF_COLOR_PALETTES[newlyLinked]) {
        flaringColorRef.current = STAFF_COLOR_PALETTES[newlyLinked].primary;
        flareTimerRef.current = 2.5;
      }
    }
    prevLinkedMembersRef.current = linkedMembersList;
    linkedMembersRef.current = linkedMembersList;
  }, [linkedMembersList]);

  useEffect(() => {
    dragActiveMemberRef.current = dragActiveMember;
    cursorPosRef.current = cursorPos;
  }, [dragActiveMember, cursorPos]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isSubscribed = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 5.0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const stageColor = new THREE.Color(accentColor);
    const pointLight1 = setupLighting(scene, stageColor);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const textureLoader = new THREE.TextureLoader();
    let mixer: THREE.AnimationMixer | null = null;
    let beaconElements: BeaconStageElements | null = null;

    if (stageId === 3) {
      setupWitherStage(
        mainGroup,
        () => isSubscribed,
        (m) => {
          mixer = m;
        },
      );
    } else if (stageId === 2) {
      beaconElements = setupBeaconStage(mainGroup, textureLoader, stageColor);
    } else {
      setupBlockStage(stageId, mainGroup, textureLoader, stageColor);
    }

    const { particles, particleGeo, particleMat } = setupAmbientParticles(scene, stageColor);

    const reusables = {
      targetPos: new THREE.Vector3(0, -0.05, 0.1),
      rayVec: new THREE.Vector3(),
      deltaVec: new THREE.Vector3(),
      upVec: new THREE.Vector3(0, 0, 1),
      sideVec: new THREE.Vector3(),
      defaultAnchor: new THREE.Vector3(0, -1.05, 0.1),
      colorA: new THREE.Color(),
      colorB: new THREE.Color(),
      targetColor: new THREE.Color(),
      whiteColor: new THREE.Color(0xffffff),
      vCol: new THREE.Color(),
    };

    const renderCtx: RenderContext = {
      container,
      camera,
      pointLight1,
      particleMat,
      accentColor,
      activeStaffColorRef,
      linkedMembersRef,
      dragActiveMemberRef,
      cursorPosRef,
      flareTimerRef,
      flaringColorRef,
      hasExplodedRef,
      explosionTimerRef,
      explosionDelayTimerRef,
    };

    const startTime = performance.now();
    let lastTime = startTime;

    const updateStageTwo = (delta: number, elapsedTime: number) => {
      if (!beaconElements) return;

      const currentLinkedCount = linkedMembersRef.current.length;
      const isFullyLinked = currentLinkedCount === 4;

      if (flareTimerRef.current > 0) {
        flareTimerRef.current -= delta;
      }
      const isFlaring = flareTimerRef.current > 0;

      if (isFullyLinked && !hasExplodedRef.current) {
        if (explosionDelayTimerRef.current > 0) {
          explosionDelayTimerRef.current -= delta;
        } else {
          hasExplodedRef.current = true;
          explosionTimerRef.current = 1.6;
        }
      }
      if (!isFullyLinked) {
        hasExplodedRef.current = false;
        explosionDelayTimerRef.current = 0.4;
      }

      updateExplosionOrStarRest(beaconElements, delta, isFullyLinked, renderCtx);
      updateBeaconBeamAnimation(
        beaconElements,
        delta,
        isFullyLinked,
        isFlaring,
        dragActiveMemberRef.current,
      );

      beaconElements.activeBeaconCore.scale.set(1, 1, 1);
      beaconElements.activeBeaconCore.rotation.set(0, 0, 0);

      const targetHex = resolveBeaconTargetColorHex(
        isFlaring,
        flaringColorRef.current,
        dragActiveMemberRef.current,
        activeStaffColorRef.current,
        accentColor,
      );
      reusables.targetColor.set(targetHex);

      (beaconElements.activeBeamAuraMesh.material as THREE.MeshBasicMaterial).color.lerp(
        reusables.targetColor,
        0.08,
      );
      pointLight1.color.lerp(reusables.targetColor, 0.08);
      particleMat.color.lerp(reusables.targetColor, 0.08);

      STAFF_RAY_NAMES.forEach((memberName) => {
        const rayEntry = beaconElements?.staff3DRaysDict[memberName];
        if (rayEntry) {
          updateSingleLightningRay(
            memberName,
            rayEntry,
            renderCtx,
            isFullyLinked,
            elapsedTime,
            reusables,
          );
        }
      });
    };

    renderer.setAnimationLoop((_time) => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const elapsedTime = (now - startTime) / 1000;

      if (mixer) {
        mixer.update(delta);
      }

      if (stageId === 2) {
        updateStageTwo(delta, elapsedTime);
      }

      mainGroup.rotation.set(0, 0, 0);
      mainGroup.position.y = stageId === 3 ? -0.55 : 0;

      particles.rotation.y = elapsedTime * 0.12;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

      renderer.render(scene, camera);
    });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isSubscribed = false;
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [stageId, accentColor]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none size-full select-none"
      aria-hidden="true"
    />
  );
};
