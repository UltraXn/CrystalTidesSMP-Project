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

/**
 * Creates UV coordinates for a Three.js BoxGeometry matching Minecraft's standard UV layout.
 */
function applyMinecraftUVs(
  geometry: THREE.BoxGeometry,
  u: number,
  v: number,
  dx: number,
  dy: number,
  dz: number,
  tw: number,
  th: number,
  mirror = false
) {
  // Face UVs in pixels: [u, v, width, height]
  // Three.js BoxGeometry face order: +X (right), -X (left), +Y (top), -Y (bottom), +Z (front), -Z (back)
  const facesUV = [
    [u + dz + dx, v + dz, dz, dy], // +X (right)
    [u, v + dz, dz, dy],           // -X (left)
    [u + dz, v, dx, dz],           // +Y (top)
    [u + dz + dx, v, dx, dz],      // -Y (bottom)
    [u + dz, v + dz, dx, dy],      // +Z (front)
    [u + dz + dx + dz, v + dz, dx, dy] // -Z (back)
  ];

  if (mirror) {
    // Swap right and left face UVs if mirrored
    const tmp = facesUV[0];
    facesUV[0] = facesUV[1];
    facesUV[1] = tmp;
  }

  const uvAttr = geometry.attributes.uv;
  if (!uvAttr) return;

  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    const [fu, fv, fw, fh] = facesUV[faceIdx];

    // Convert pixel coordinates to normalized 0.0 - 1.0 UV space (Y is inverted in WebGL UVs)
    const u0 = fu / tw;
    const u1 = (fu + fw) / tw;
    const v1 = 1.0 - fv / th;
    const v0 = 1.0 - (fv + fh) / th;

    const baseVertex = faceIdx * 4;
    
    // Three.js BoxGeometry quad vertex order:
    // V0: Top-Left (u0, v1), V1: Top-Right (u1, v1), V2: Bottom-Left (u0, v0), V3: Bottom-Right (u1, v0)
    uvAttr.setXY(baseVertex + 0, u0, v1);
    uvAttr.setXY(baseVertex + 1, u1, v1);
    uvAttr.setXY(baseVertex + 2, u0, v0);
    uvAttr.setXY(baseVertex + 3, u1, v0);
  }
  uvAttr.needsUpdate = true;
}

/**
 * Parses Bedrock .geo.json geometry and builds a Three.js Object3D hierarchy.
 */
export function buildBedrockModel(
  geoData: BedrockGeometry,
  texture?: THREE.Texture
): THREE.Object3D {
  const rootGroup = new THREE.Group();

  const geo = geoData['minecraft:geometry'] && geoData['minecraft:geometry'][0];
  if (!geo) return rootGroup;

  const tw = geo.description.texture_width || 64;
  const th = geo.description.texture_height || 64;

  const mat = new THREE.MeshStandardMaterial({
    map: texture || null,
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide
  });

  if (texture) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }

  const boneMap = new Map<string, { group: THREE.Group; pivot: [number, number, number] }>();

  // First pass: create groups for all bones
  for (const bone of geo.bones) {
    const group = new THREE.Group();
    group.name = bone.name;

    const pivot = bone.pivot || [0, 0, 0];
    // Convert Minecraft coordinates (Y is up, Z is depth) to Three.js
    group.position.set(pivot[0], pivot[1], pivot[2]);

    if (bone.rotation) {
      group.rotation.set(
        THREE.MathUtils.degToRad(bone.rotation[0]),
        THREE.MathUtils.degToRad(bone.rotation[1]),
        THREE.MathUtils.degToRad(bone.rotation[2]),
        'ZYX'
      );
    }

    boneMap.set(bone.name, { group, pivot });
  }

  // Second pass: attach bones to parents and add cube meshes
  for (const bone of geo.bones) {
    const current = boneMap.get(bone.name);
    if (!current) continue;

    if (bone.parent && boneMap.has(bone.parent)) {
      const parent = boneMap.get(bone.parent)!;
      // Adjust relative position to parent pivot
      current.group.position.set(
        current.pivot[0] - parent.pivot[0],
        current.pivot[1] - parent.pivot[1],
        current.pivot[2] - parent.pivot[2]
      );
      parent.group.add(current.group);
    } else {
      rootGroup.add(current.group);
    }

    if (bone.cubes && bone.cubes.length > 0) {
      for (const cube of bone.cubes) {
        const inflate = cube.inflate || 0;
        const rawDx = cube.size[0] + inflate * 2;
        const rawDy = cube.size[1] + inflate * 2;
        const rawDz = cube.size[2] + inflate * 2;

        // Skip only if ALL dimensions are zero (degenerate cube)
        if (rawDx <= 0 && rawDy <= 0 && rawDz <= 0) continue;

        // For flat planes (one dimension = 0), use a thin epsilon so the
        // BoxGeometry still renders the two visible perpendicular faces.
        // Minecraft uses 0-width cubes for decorative billboards (sword blades,
        // spikes, helmet wings, etc.)
        const PLANE_EPSILON = 0.01;
        const dx = rawDx > 0 ? rawDx : PLANE_EPSILON;
        const dy = rawDy > 0 ? rawDy : PLANE_EPSILON;
        const dz = rawDz > 0 ? rawDz : PLANE_EPSILON;

        const boxGeo = new THREE.BoxGeometry(dx, dy, dz);
        applyMinecraftUVs(boxGeo, cube.uv[0], cube.uv[1], cube.size[0], cube.size[1], cube.size[2], tw, th, cube.mirror);

        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Position mesh relative to bone pivot
        const cx = cube.origin[0] + cube.size[0] / 2 - current.pivot[0];
        const cy = cube.origin[1] + cube.size[1] / 2 - current.pivot[1];
        const cz = cube.origin[2] + cube.size[2] / 2 - current.pivot[2];

        mesh.position.set(cx, cy, cz);
        current.group.add(mesh);
      }
    }
  }

  // Center and scale root group appropriately for viewer (1/16 scale for Minecraft block units)
  rootGroup.scale.set(0.0625, 0.0625, 0.0625);

  return rootGroup;
}
