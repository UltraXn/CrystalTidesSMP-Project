import * as THREE from 'three';

export interface BedrockCube {
  origin: [number, number, number];
  size: [number, number, number];
  uv: [number, number];
  inflate?: number;
  mirror?: boolean;
}

export interface BedrockBone {
  name: string;
  parent?: string;
  pivot?: [number, number, number];
  rotation?: [number, number, number];
  cubes?: BedrockCube[];
}

export interface BedrockGeometry {
  format_version: string;
  'minecraft:geometry': Array<{
    description: {
      identifier: string;
      texture_width: number;
      texture_height: number;
    };
    bones: BedrockBone[];
  }>;
}

interface BoneNode {
  group: THREE.Group;
  pivot: [number, number, number];
}

type FaceUV = [number, number, number, number];

const DEFAULT_TEXTURE_DIMENSION = 64;
const PLANE_EPSILON = 0.01;
const BEDROCK_BLOCK_SCALE = 0.0625;
const ROTATION_ORDER = 'ZYX';

/**
 * Computes pixel UV rectangles for each of the 6 BoxGeometry faces.
 * Order: +X (right), -X (left), +Y (top), -Y (bottom), +Z (front), -Z (back)
 */
function computeFaceUVs(
  u: number,
  v: number,
  dx: number,
  dy: number,
  dz: number,
  mirror: boolean,
): FaceUV[] {
  const facesUV: FaceUV[] = [
    [u + dz + dx, v + dz, dz, dy], // +X (right)
    [u, v + dz, dz, dy], // -X (left)
    [u + dz, v, dx, dz], // +Y (top)
    [u + dz + dx, v, dx, dz], // -Y (bottom)
    [u + dz, v + dz, dx, dy], // +Z (front)
    [u + dz + dx + dz, v + dz, dx, dy], // -Z (back)
  ];

  if (mirror) {
    const rightFace = facesUV[0];
    facesUV[0] = facesUV[1];
    facesUV[1] = rightFace;
  }

  return facesUV;
}

/**
 * Creates UV coordinates for a Three.js BoxGeometry matching Minecraft's standard UV layout.
 */
function applyMinecraftUVs(
  geometry: THREE.BoxGeometry,
  cube: BedrockCube,
  tw: number,
  th: number,
): void {
  const uvAttr = geometry.attributes.uv;
  if (!uvAttr) return;

  const [u, v] = cube.uv;
  const [dx, dy, dz] = cube.size;
  const facesUV = computeFaceUVs(u, v, dx, dy, dz, cube.mirror ?? false);

  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    const [fu, fv, fw, fh] = facesUV[faceIdx];

    const u0 = fu / tw;
    const u1 = (fu + fw) / tw;
    const v1 = 1.0 - fv / th;
    const v0 = 1.0 - (fv + fh) / th;

    const baseVertex = faceIdx * 4;
    uvAttr.setXY(baseVertex + 0, u0, v1);
    uvAttr.setXY(baseVertex + 1, u1, v1);
    uvAttr.setXY(baseVertex + 2, u0, v0);
    uvAttr.setXY(baseVertex + 3, u1, v0);
  }

  uvAttr.needsUpdate = true;
}

/**
 * Calculates cube dimensions taking inflate and flat plane epsilons into account.
 */
function resolveCubeDimensions(cube: BedrockCube): [number, number, number] | null {
  const inflate = cube.inflate ?? 0;
  const rawDx = cube.size[0] + inflate * 2;
  const rawDy = cube.size[1] + inflate * 2;
  const rawDz = cube.size[2] + inflate * 2;

  if (rawDx <= 0 && rawDy <= 0 && rawDz <= 0) {
    return null;
  }

  const dx = rawDx > 0 ? rawDx : PLANE_EPSILON;
  const dy = rawDy > 0 ? rawDy : PLANE_EPSILON;
  const dz = rawDz > 0 ? rawDz : PLANE_EPSILON;

  return [dx, dy, dz];
}

/**
 * Creates and positions a single cube mesh relative to its parent bone's pivot.
 */
function createCubeMesh(
  cube: BedrockCube,
  pivot: [number, number, number],
  material: THREE.Material,
  textureWidth: number,
  textureHeight: number,
): THREE.Mesh | null {
  const dimensions = resolveCubeDimensions(cube);
  if (!dimensions) {
    return null;
  }

  const [dx, dy, dz] = dimensions;
  const boxGeo = new THREE.BoxGeometry(dx, dy, dz);

  applyMinecraftUVs(boxGeo, cube, textureWidth, textureHeight);

  const mesh = new THREE.Mesh(boxGeo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const cx = cube.origin[0] + cube.size[0] / 2 - pivot[0];
  const cy = cube.origin[1] + cube.size[1] / 2 - pivot[1];
  const cz = cube.origin[2] + cube.size[2] / 2 - pivot[2];

  mesh.position.set(cx, cy, cz);
  return mesh;
}

/**
 * Prepares texture settings for pixelated Minecraft aesthetics.
 */
function configureTexture(texture?: THREE.Texture): void {
  if (!texture) return;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
}

/**
 * Instantiates the default standard material for Bedrock models.
 */
function createBedrockMaterial(texture?: THREE.Texture): THREE.MeshStandardMaterial {
  configureTexture(texture);
  return new THREE.MeshStandardMaterial({
    map: texture || null,
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
  });
}

/**
 * Creates a bone group with pivot and rotation configured.
 */
function createBoneNode(bone: BedrockBone): BoneNode {
  const group = new THREE.Group();
  group.name = bone.name;

  const pivot: [number, number, number] = bone.pivot ?? [0, 0, 0];
  group.position.set(pivot[0], pivot[1], pivot[2]);

  if (bone.rotation) {
    group.rotation.set(
      THREE.MathUtils.degToRad(bone.rotation[0]),
      THREE.MathUtils.degToRad(bone.rotation[1]),
      THREE.MathUtils.degToRad(bone.rotation[2]),
      ROTATION_ORDER,
    );
  }

  return { group, pivot };
}

/**
 * Builds an index of all bones before hierarchy linkage.
 */
function buildBoneMap(bones: readonly BedrockBone[]): Map<string, BoneNode> {
  const boneMap = new Map<string, BoneNode>();
  for (const bone of bones) {
    boneMap.set(bone.name, createBoneNode(bone));
  }
  return boneMap;
}

/**
 * Attaches a bone group to either its parent bone or the root group.
 */
function attachBoneToParent(
  bone: BedrockBone,
  current: BoneNode,
  boneMap: Map<string, BoneNode>,
  rootGroup: THREE.Group,
): void {
  if (bone.parent && boneMap.has(bone.parent)) {
    const parent = boneMap.get(bone.parent)!;
    current.group.position.set(
      current.pivot[0] - parent.pivot[0],
      current.pivot[1] - parent.pivot[1],
      current.pivot[2] - parent.pivot[2],
    );
    parent.group.add(current.group);
  } else {
    rootGroup.add(current.group);
  }
}

/**
 * Instantiates and attaches all cubes belonging to a specific bone.
 */
function attachCubesToBone(
  bone: BedrockBone,
  current: BoneNode,
  material: THREE.Material,
  tw: number,
  th: number,
): void {
  if (!bone.cubes || bone.cubes.length === 0) return;

  for (const cube of bone.cubes) {
    const mesh = createCubeMesh(cube, current.pivot, material, tw, th);
    if (mesh) {
      current.group.add(mesh);
    }
  }
}

/**
 * Parses Bedrock .geo.json geometry and builds a Three.js Object3D hierarchy.
 */
export function buildBedrockModel(
  geoData: BedrockGeometry,
  texture?: THREE.Texture,
): THREE.Object3D {
  const rootGroup = new THREE.Group();

  const geo = geoData['minecraft:geometry']?.[0];
  if (!geo) return rootGroup;

  const tw = geo.description.texture_width || DEFAULT_TEXTURE_DIMENSION;
  const th = geo.description.texture_height || DEFAULT_TEXTURE_DIMENSION;
  const material = createBedrockMaterial(texture);
  const boneMap = buildBoneMap(geo.bones);

  for (const bone of geo.bones) {
    const current = boneMap.get(bone.name);
    if (!current) continue;

    attachBoneToParent(bone, current, boneMap, rootGroup);
    attachCubesToBone(bone, current, material, tw, th);
  }

  rootGroup.scale.set(BEDROCK_BLOCK_SCALE, BEDROCK_BLOCK_SCALE, BEDROCK_BLOCK_SCALE);
  return rootGroup;
}
