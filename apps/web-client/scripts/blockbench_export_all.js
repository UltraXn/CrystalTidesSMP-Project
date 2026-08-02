const fs = require('fs');
const path = require('path');

const extracted_root = "c:/Users/nacho/Desktop/Portafolio/crystaltides/apps/web-client/public/models/extracted";
const public_models_root = "c:/Users/nacho/Desktop/Portafolio/crystaltides/apps/web-client/public/models";

const strict_mappings = [
    // Mobs of Mythology
    ["assets_mobs_of_mythology_geo_entity_chupacabra.geo.json", "mythology/chupacabra.gltf"],
    ["assets_mobs_of_mythology_geo_entity_minotaur.geo.json", "mythology/minotaur.gltf"],
    ["assets_mobs_of_mythology_geo_entity_automaton.geo.json", "mythology/automaton.gltf"],
    ["assets_mobs_of_mythology_geo_entity_drake.geo.json", "mythology/drake.gltf"],
    ["assets_mobs_of_mythology_geo_entity_wendigo.geo.json", "mythology/wendigo.gltf"],
    // Qliphoth
    ["assets_fdbosses_bedrock_models_chesed.geo.json", "qliphoth/chesed.gltf"],
    ["assets_fdbosses_bedrock_models_malkuth.geo.json", "qliphoth/malkuth.gltf"],
    ["assets_fdbosses_bedrock_models_geburah.geo.json", "qliphoth/geburah.gltf"],
    // Critters and Companions
    ["assets_crittersandcompanions_geo_entity_red_panda.geo.json", "critters/red_panda.gltf"],
    ["assets_crittersandcompanions_geo_entity_otter.geo.json", "critters/otter.gltf"],
    ["assets_crittersandcompanions_geo_entity_ferret.geo.json", "critters/ferret.gltf"],
    ["assets_crittersandcompanions_geo_entity_dumbo_octopus.geo.json", "critters/dumbo_octopus.gltf"],
    ["assets_crittersandcompanions_geo_entity_jumping_spider.geo.json", "critters/jumping_spider.gltf"],
    ["assets_crittersandcompanions_geo_entity_koi_fish.geo.json", "critters/koi_fish.gltf"],
    ["assets_crittersandcompanions_geo_entity_leaf_insect.geo.json", "critters/leaf_insect.gltf"],
    ["assets_crittersandcompanions_geo_entity_sea_bunny.geo.json", "critters/sea_bunny.gltf"],
    ["assets_crittersandcompanions_geo_entity_dragonfly.geo.json", "critters/dragonfly.gltf"],
    ["assets_crittersandcompanions_geo_entity_shima_enaga.geo.json", "critters/shima_enaga.gltf"],
    // Ribbits
    ["assets_Ribbits_geo_entity_merchant_ribbit.geo.json", "ribbits/ribbit_merchant.gltf"],
];

function findFile(root, filename) {
    const files = [];
    function scan(dir) {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (entry.name === filename) {
                files.push(fullPath);
            }
        }
    }
    scan(root);
    return files[0] || null;
}

function findPng(geoPath) {
    const geoDir = path.dirname(geoPath);
    const filename = path.basename(geoPath);
    const cleanName = filename.includes('_entity_') ? filename.split('_entity_')[1].replace('.geo.json', '') : filename.replace('.geo.json', '');
    const parentDir = path.dirname(geoDir);
    
    function scanPngs(dir) {
        let results = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results = results.concat(scanPngs(full));
            } else if (entry.name.endsWith('.png')) {
                results.push(full);
            }
        }
        return results;
    }

    const allPngs = scanPngs(parentDir);
    const exact = allPngs.find(p => path.basename(p) === `assets_crittersandcompanions_textures_entity_${cleanName}.png` || path.basename(p) === `assets_mobs_of_mythology_textures_entity_${cleanName}.png`);
    if (exact) return exact;

    const matched = allPngs.find(p => path.basename(p).endsWith(`_${cleanName}.png`) && !path.basename(p).includes('baby') && !path.basename(p).includes('sleeping'));
    if (matched) return matched;

    return allPngs.find(p => path.basename(p).includes(cleanName) && !path.basename(p).includes('baby') && !path.basename(p).includes('sleeping')) || null;
}

async function processAllEntities() {
    let successCount = 0;
    for (const [geoFile, relOut] of strict_mappings) {
        const fullGeo = findFile(extracted_root, geoFile);
        if (!fullGeo) continue;

        Formats.bedrock.new();
        const jsonContent = JSON.parse(fs.readFileSync(fullGeo, 'utf8'));
        Codecs.bedrock.load(jsonContent, { path: fullGeo });

        const pngPath = findPng(fullGeo);
        if (pngPath && fs.existsSync(pngPath)) {
            const cleanName = path.basename(pngPath, '.png');
            const tex = new Texture({ name: cleanName }).fromPath(pngPath);
            await new Promise((resolve) => {
                tex.load(() => {
                    tex.add();
                    resolve();
                });
            });
        }

        const outPath = path.join(public_models_root, relOut).replace(/\\/g, '/');
        const gltfRes = await Codecs.gltf.compile();
        const str = typeof gltfRes === 'string' ? gltfRes : JSON.stringify(gltfRes, null, 2);

        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, str);

        if (pngPath && fs.existsSync(pngPath)) {
            const outPng = outPath.replace('.gltf', '.png');
            fs.copyFileSync(pngPath, outPng);
        }

        successCount++;
    }
    return `Blockbench MCP successfully compiled and exported ${successCount} models with loaded textures!`;
}

processAllEntities();
