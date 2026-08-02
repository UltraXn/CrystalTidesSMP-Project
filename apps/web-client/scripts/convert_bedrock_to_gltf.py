import json
import os
import glob
import math
import base64
import struct

def deg2rad(deg):
    return deg * math.pi / 180.0

def identity_matrix():
    return [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ]

def multiply_matrices(A, B):
    C = [[0.0]*4 for _ in range(4)]
    for i in range(4):
        for j in range(4):
            C[i][j] = sum(A[i][k] * B[k][j] for k in range(4))
    return C

def translate_matrix(tx, ty, tz):
    M = identity_matrix()
    M[0][3] = tx
    M[1][3] = ty
    M[2][3] = tz
    return M

def rotate_matrix_xyz(rx_deg, ry_deg, rz_deg):
    rad_x, rad_y, rad_z = deg2rad(rx_deg), deg2rad(ry_deg), deg2rad(rz_deg)
    
    cx, sx = math.cos(rad_x), math.sin(rad_x)
    cy, sy = math.cos(rad_y), math.sin(rad_y)
    cz, sz = math.cos(rad_z), math.sin(rad_z)

    Rx = [[1,0,0,0], [0,cx,-sx,0], [0,sx,cx,0], [0,0,0,1]]
    Ry = [[cy,0,sy,0], [0,1,0,0], [-sy,0,cy,0], [0,0,0,1]]
    Rz = [[cz,-sz,0,0], [sz,cz,0,0], [0,0,1,0], [0,0,0,1]]

    return multiply_matrices(Rz, multiply_matrices(Ry, Rx))

def transform_point(M, pt):
    x, y, z = pt
    tx = M[0][0]*x + M[0][1]*y + M[0][2]*z + M[0][3]
    ty = M[1][0]*x + M[1][1]*y + M[1][2]*z + M[1][3]
    tz = M[2][0]*x + M[2][1]*y + M[2][2]*z + M[2][3]
    return (tx, ty, tz)

def build_bone_matrices(bones):
    bone_map = {b["name"]: b for b in bones}
    world_matrices = {}

    def get_world_matrix(b_name):
        if b_name in world_matrices:
            return world_matrices[b_name]
        
        b = bone_map.get(b_name)
        if not b:
            return identity_matrix()

        pivot = b.get("pivot", [0, 0, 0])
        rot = b.get("rotation", [0, 0, 0])

        px, py, pz = pivot[0]/16.0, pivot[1]/16.0, pivot[2]/16.0
        rx, ry, rz = rot[0], rot[1], rot[2]

        T_pos = translate_matrix(px, py, pz)
        R = rotate_matrix_xyz(rx, ry, rz)
        T_neg = translate_matrix(-px, -py, -pz)

        local_M = multiply_matrices(T_pos, multiply_matrices(R, T_neg))

        parent_name = b.get("parent")
        if parent_name:
            parent_M = get_world_matrix(parent_name)
            world_M = multiply_matrices(parent_M, local_M)
        else:
            world_M = local_M

        world_matrices[b_name] = world_M
        return world_M

    for b in bones:
        get_world_matrix(b["name"])

    return world_matrices

def build_cube_mesh(cube, bone_matrix, tex_w=64, tex_h=64):
    origin = cube.get("origin", [0, 0, 0])
    size = cube.get("size", [1, 1, 1])
    uv = cube.get("uv", [0, 0])
    mirror = cube.get("mirror", False)

    ox, oy, oz = origin
    dx, dy, dz = size

    x0, y0, z0 = ox / 16.0, oy / 16.0, oz / 16.0
    x1, y1, z1 = (ox + dx) / 16.0, (oy + dy) / 16.0, (oz + dz) / 16.0

    raw_verts = {
        'x0y0z0': (x0,y0,z0), 'x1y0z0': (x1,y0,z0),
        'x1y1z0': (x1,y1,z0), 'x0y1z0': (x0,y1,z0),
        'x0y0z1': (x0,y0,z1), 'x1y0z1': (x1,y0,z1),
        'x1y1z1': (x1,y1,z1), 'x0y1z1': (x0,y1,z1),
    }

    tf_verts = {k: transform_point(bone_matrix, v) for k, v in raw_verts.items()}

    if isinstance(uv, dict):
        def parse_face_uv(face_key, default_verts):
            f_data = uv.get(face_key, {})
            f_uv = f_data.get("uv", [0, 0])
            f_sz = f_data.get("uv_size", [dx, dy])
            u0, v0 = f_uv[0], f_uv[1]
            du, dv = f_sz[0], f_sz[1]
            return {
                'verts': default_verts,
                'uv': [(u0+du, v0+dv), (u0, v0+dv), (u0, v0), (u0+du, v0)]
            }

        faces = [
            parse_face_uv('north', [tf_verts['x1y0z0'], tf_verts['x0y0z0'], tf_verts['x0y1z0'], tf_verts['x1y1z0']]),
            parse_face_uv('south', [tf_verts['x0y0z1'], tf_verts['x1y0z1'], tf_verts['x1y1z1'], tf_verts['x0y1z1']]),
            parse_face_uv('west',  [tf_verts['x0y0z0'], tf_verts['x0y0z1'], tf_verts['x0y1z1'], tf_verts['x0y1z0']]),
            parse_face_uv('east',  [tf_verts['x1y0z1'], tf_verts['x1y0z0'], tf_verts['x1y1z0'], tf_verts['x1y1z1']]),
            parse_face_uv('up',    [tf_verts['x0y1z0'], tf_verts['x1y1z0'], tf_verts['x1y1z1'], tf_verts['x0y1z1']]),
            parse_face_uv('down',  [tf_verts['x0y0z1'], tf_verts['x1y0z1'], tf_verts['x1y0z0'], tf_verts['x0y0z0']])
        ]
    else:
        u, v = uv[0] if isinstance(uv, list) else 0, uv[1] if isinstance(uv, list) else 0

        if not mirror:
            faces = [
                {'verts': [tf_verts['x1y0z0'], tf_verts['x0y0z0'], tf_verts['x0y1z0'], tf_verts['x1y1z0']], 'uv': [(u+dz+dx, v+dz+dy), (u+dz, v+dz+dy), (u+dz, v+dz), (u+dz+dx, v+dz)]},
                {'verts': [tf_verts['x0y0z1'], tf_verts['x1y0z1'], tf_verts['x1y1z1'], tf_verts['x0y1z1']], 'uv': [(u+2*dz+dx, v+dz+dy), (u+2*dz+2*dx, v+dz+dy), (u+2*dz+2*dx, v+dz), (u+2*dz+dx, v+dz)]},
                {'verts': [tf_verts['x0y0z0'], tf_verts['x0y0z1'], tf_verts['x0y1z1'], tf_verts['x0y1z0']], 'uv': [(u, v+dz+dy), (u+dz, v+dz+dy), (u+dz, v+dz), (u, v+dz)]},
                {'verts': [tf_verts['x1y0z1'], tf_verts['x1y0z0'], tf_verts['x1y1z0'], tf_verts['x1y1z1']], 'uv': [(u+dz+dx+dz, v+dz+dy), (u+dz+dx, v+dz+dy), (u+dz+dx, v+dz), (u+dz+dx+dz, v+dz)]},
                {'verts': [tf_verts['x0y1z0'], tf_verts['x1y1z0'], tf_verts['x1y1z1'], tf_verts['x0y1z1']], 'uv': [(u+dz, v), (u+dz+dx, v), (u+dz+dx, v+dz), (u+dz, v+dz)]},
                {'verts': [tf_verts['x0y0z1'], tf_verts['x1y0z1'], tf_verts['x1y0z0'], tf_verts['x0y0z0']], 'uv': [(u+dz+dx, v), (u+dz+2*dx, v), (u+dz+2*dx, v+dz), (u+dz+dx, v+dz)]}
            ]
        else:
            faces = [
                {'verts': [tf_verts['x1y0z0'], tf_verts['x0y0z0'], tf_verts['x0y1z0'], tf_verts['x1y1z0']], 'uv': [(u+dz, v+dz+dy), (u+dz+dx, v+dz+dy), (u+dz+dx, v+dz), (u+dz, v+dz)]},
                {'verts': [tf_verts['x0y0z1'], tf_verts['x1y0z1'], tf_verts['x1y1z1'], tf_verts['x0y1z1']], 'uv': [(u+2*dz+2*dx, v+dz+dy), (u+2*dz+dx, v+dz+dy), (u+2*dz+dx, v+dz), (u+2*dz+2*dx, v+dz)]},
                {'verts': [tf_verts['x0y0z0'], tf_verts['x0y0z1'], tf_verts['x0y1z1'], tf_verts['x0y1z0']], 'uv': [(u+dz+dx+dz, v+dz+dy), (u+dz+dx, v+dz+dy), (u+dz+dx, v+dz), (u+dz+dx+dz, v+dz)]},
                {'verts': [tf_verts['x1y0z1'], tf_verts['x1y0z0'], tf_verts['x1y1z0'], tf_verts['x1y1z1']], 'uv': [(u, v+dz+dy), (u+dz, v+dz+dy), (u+dz, v+dz), (u, v+dz)]},
                {'verts': [tf_verts['x0y1z0'], tf_verts['x1y1z0'], tf_verts['x1y1z1'], tf_verts['x0y1z1']], 'uv': [(u+dz+dx, v), (u+dz, v), (u+dz, v+dz), (u+dz, v+dz)]},
                {'verts': [tf_verts['x0y0z1'], tf_verts['x1y0z1'], tf_verts['x1y0z0'], tf_verts['x0y0z0']], 'uv': [(u+dz+2*dx, v), (u+dz+dx, v), (u+dz+dx, v+dz), (u+dz+2*dx, v+dz)]}
            ]

    positions = []
    uvs = []
    indices = []

    for f in faces:
        base_idx = len(positions) // 3
        for v_pos in f['verts']:
            positions.extend(v_pos)

        for (u_px, v_px) in f['uv']:
            u_gltf = u_px / float(tex_w)
            v_gltf = 1.0 - (v_px / float(tex_h))
            uvs.extend([u_gltf, v_gltf])

        indices.extend([base_idx, base_idx+1, base_idx+2, base_idx, base_idx+2, base_idx+3])

    return positions, uvs, indices

def find_exact_matching_png(geo_path):
    geo_dir = os.path.dirname(geo_path)
    filename = os.path.basename(geo_path)
    clean_name = filename.split('_entity_')[-1].replace('.geo.json', '') if '_entity_' in filename else filename.replace('.geo.json', '')
    
    parent_dir = os.path.dirname(geo_dir)
    all_pngs = glob.glob(os.path.join(parent_dir, "**", "*.png"), recursive=True)
    
    exact_matches = [p for p in all_pngs if os.path.basename(p) == f"assets_crittersandcompanions_textures_entity_{clean_name}.png" or os.path.basename(p) == f"assets_mobs_of_mythology_textures_entity_{clean_name}.png"]
    if exact_matches:
        return exact_matches[0]

    matches = [p for p in all_pngs if os.path.basename(p).endswith(f"_{clean_name}.png") and not 'baby' in os.path.basename(p) and not 'sleeping' in os.path.basename(p)]
    if matches:
        return matches[0]

    matches = [p for p in all_pngs if clean_name in os.path.basename(p) and not 'baby' in os.path.basename(p) and not 'sleeping' in os.path.basename(p)]
    if matches:
        return matches[0]

    return None

def convert_geo_to_gltf(geo_path, output_gltf_path):
    with open(geo_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    geos = data.get("minecraft:geometry", [])
    if not geos:
        return False

    geo = geos[0]
    desc = geo.get("description", {})
    tex_w = desc.get("texture_width", 64)
    tex_h = desc.get("texture_height", 64)

    bones = geo.get("bones", [])
    world_matrices = build_bone_matrices(bones)

    all_positions = []
    all_uvs = []
    all_indices = []

    for bone in bones:
        b_name = bone.get("name", "")
        b_mat = world_matrices.get(b_name, identity_matrix())
        for cube in bone.get("cubes", []):
            pos, uvs, idx = build_cube_mesh(cube, b_mat, tex_w, tex_h)
            curr_v_count = len(all_positions) // 3
            all_positions.extend(pos)
            all_uvs.extend(uvs)
            for i in idx:
                all_indices.append(i + curr_v_count)

    if not all_positions:
        return False

    pos_bytes = bytearray()
    min_pos = [float('inf'), float('inf'), float('inf')]
    max_pos = [float('-inf'), float('-inf'), float('-inf')]

    for i in range(0, len(all_positions), 3):
        x, y, z = all_positions[i], all_positions[i+1], all_positions[i+2]
        pos_bytes.extend(struct.pack('<fff', x, y, z))
        min_pos[0] = min(min_pos[0], x)
        min_pos[1] = min(min_pos[1], y)
        min_pos[2] = min(min_pos[2], z)
        max_pos[0] = max(max_pos[0], x)
        max_pos[1] = max(max_pos[1], y)
        max_pos[2] = max(max_pos[2], z)

    uv_bytes = bytearray()
    for i in range(0, len(all_uvs), 2):
        u, v = all_uvs[i], all_uvs[i+1]
        uv_bytes.extend(struct.pack('<ff', u, v))

    idx_bytes = bytearray()
    for idx in all_indices:
        idx_bytes.extend(struct.pack('<H', idx))

    def pad(b):
        while len(b) % 4 != 0:
            b.append(0)
        return b

    pos_bytes = pad(pos_bytes)
    uv_bytes = pad(uv_bytes)
    idx_bytes = pad(idx_bytes)

    total_bin = pos_bytes + uv_bytes + idx_bytes
    b64_uri = "data:application/octet-stream;base64," + base64.b64encode(total_bin).decode('ascii')

    pos_offset = 0
    pos_length = len(pos_bytes)
    uv_offset = pos_length
    uv_length = len(uv_bytes)
    idx_offset = pos_length + uv_length
    idx_length = len(idx_bytes)

    png_path = find_exact_matching_png(geo_path)
    images_def = []
    textures_def = []
    materials_def = [{
        "name": "MobMaterial",
        "pbrMetallicRoughness": {
            "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
            "roughnessFactor": 0.9,
            "metallicFactor": 0.0
        },
        "extensions": {
            "KHR_materials_unlit": {}
        }
    }]
    prim_mat = 0

    if png_path and os.path.exists(png_path):
        with open(png_path, 'rb') as pf:
            png_b64 = base64.b64encode(pf.read()).decode('ascii')
        img_uri = "data:image/png;base64," + png_b64
        images_def.append({ "uri": img_uri })
        textures_def.append({ "source": 0 })
        materials_def[0]["pbrMetallicRoughness"]["baseColorTexture"] = { "index": 0 }

        out_png_path = output_gltf_path.replace('.gltf', '.png')
        os.makedirs(os.path.dirname(out_png_path), exist_ok=True)
        with open(out_png_path, 'wb') as pf:
            pf.write(base64.b64decode(png_b64))
        print(f"Matched Texture: {os.path.basename(png_path)} -> {os.path.basename(out_png_path)}")

    gltf = {
        "asset": { "version": "2.0", "generator": "Fast Bedrock Python Converter" },
        "extensionsUsed": ["KHR_materials_unlit"],
        "scene": 0,
        "scenes": [{ "nodes": [0] }],
        "nodes": [{ "mesh": 0, "name": geo.get("description", {}).get("identifier", "Mob") }],
        "meshes": [{
            "primitives": [{
                "attributes": {
                    "POSITION": 0,
                    "TEXCOORD_0": 1
                },
                "indices": 2,
                "material": prim_mat
            }]
        }],
        "materials": materials_def,
        "accessors": [
            { "bufferView": 0, "byteOffset": 0, "componentType": 5126, "count": len(all_positions)//3, "type": "VEC3", "min": min_pos, "max": max_pos },
            { "bufferView": 1, "byteOffset": 0, "componentType": 5126, "count": len(all_uvs)//2, "type": "VEC2" },
            { "bufferView": 2, "byteOffset": 0, "componentType": 5123, "count": len(all_indices), "type": "SCALAR" }
        ],
        "bufferViews": [
            { "buffer": 0, "byteOffset": pos_offset, "byteLength": pos_length, "target": 34962 },
            { "buffer": 0, "byteOffset": uv_offset, "byteLength": uv_length, "target": 34962 },
            { "buffer": 0, "byteOffset": idx_offset, "byteLength": idx_length, "target": 34963 }
        ],
        "buffers": [{ "uri": b64_uri, "byteLength": len(total_bin) }]
    }

    if images_def:
        gltf["images"] = images_def
        gltf["textures"] = textures_def

    os.makedirs(os.path.dirname(output_gltf_path), exist_ok=True)
    with open(output_gltf_path, 'w', encoding='utf-8') as f:
        json.dump(gltf, f, indent=2)

    print(f"Successfully converted {os.path.basename(geo_path)} -> {os.path.basename(output_gltf_path)}")
    return True

if __name__ == "__main__":
    extracted_root = "c:/Users/nacho/Desktop/Portafolio/crystaltides/apps/web-client/public/models/extracted"
    public_models_root = "c:/Users/nacho/Desktop/Portafolio/crystaltides/apps/web-client/public/models"

    strict_mappings = [
        # Mobs of Mythology
        ("assets_mobs_of_mythology_geo_entity_chupacabra.geo.json", "mythology/chupacabra.gltf"),
        ("assets_mobs_of_mythology_geo_entity_minotaur.geo.json", "mythology/minotaur.gltf"),
        ("assets_mobs_of_mythology_geo_entity_automaton.geo.json", "mythology/automaton.gltf"),
        ("assets_mobs_of_mythology_geo_entity_drake.geo.json", "mythology/drake.gltf"),
        ("assets_mobs_of_mythology_geo_entity_wendigo.geo.json", "mythology/wendigo.gltf"),
        # Qliphoth
        ("assets_fdbosses_bedrock_models_chesed.geo.json", "qliphoth/chesed.gltf"),
        ("assets_fdbosses_bedrock_models_malkuth.geo.json", "qliphoth/malkuth.gltf"),
        ("assets_fdbosses_bedrock_models_geburah.geo.json", "qliphoth/geburah.gltf"),
        # Critters and Companions FULL Fauna
        ("assets_crittersandcompanions_geo_entity_red_panda.geo.json", "critters/red_panda.gltf"),
        ("assets_crittersandcompanions_geo_entity_otter.geo.json", "critters/otter.gltf"),
        ("assets_crittersandcompanions_geo_entity_ferret.geo.json", "critters/ferret.gltf"),
        ("assets_crittersandcompanions_geo_entity_dumbo_octopus.geo.json", "critters/dumbo_octopus.gltf"),
        ("assets_crittersandcompanions_geo_entity_jumping_spider.geo.json", "critters/jumping_spider.gltf"),
        ("assets_crittersandcompanions_geo_entity_koi_fish.geo.json", "critters/koi_fish.gltf"),
        ("assets_crittersandcompanions_geo_entity_leaf_insect.geo.json", "critters/leaf_insect.gltf"),
        ("assets_crittersandcompanions_geo_entity_sea_bunny.geo.json", "critters/sea_bunny.gltf"),
        ("assets_crittersandcompanions_geo_entity_dragonfly.geo.json", "critters/dragonfly.gltf"),
        ("assets_crittersandcompanions_geo_entity_shima_enaga.geo.json", "critters/shima_enaga.gltf"),
        # Ribbits
        ("assets_Ribbits_geo_entity_merchant_ribbit.geo.json", "ribbits/ribbit_merchant.gltf"),
    ]

    for exact_filename, rel_out in strict_mappings:
        matches = glob.glob(os.path.join(extracted_root, "**", exact_filename), recursive=True)
        if matches:
            out_full = os.path.join(public_models_root, rel_out)
            convert_geo_to_gltf(matches[0], out_full)
