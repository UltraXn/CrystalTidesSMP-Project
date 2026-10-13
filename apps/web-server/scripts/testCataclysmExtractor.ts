import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';

function sanitizeControlChars(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    result += code >= 0 && code <= 31 ? ' ' : text[i];
  }
  return result;
}

function findCataclysmJar(modsDir: string): string | null {
  const files = fs.readdirSync(modsDir);
  return files.find((f) => f.toLowerCase().includes('cataclysm') && f.endsWith('.jar')) ?? null;
}

function extractLangJson(zip: AdmZip): Record<string, unknown> {
  const zipEntries = zip.getEntries();
  const esLangEntry = zipEntries.find((e) => e.entryName === 'assets/cataclysm/lang/es_es.json');
  const enLangEntry = zipEntries.find((e) => e.entryName === 'assets/cataclysm/lang/en_us.json');
  const targetEntry = esLangEntry ?? enLangEntry;

  if (!targetEntry) return {};

  try {
    const rawText = zip.readAsText(targetEntry);
    const sanitized = sanitizeControlChars(rawText);
    return JSON.parse(sanitized) as Record<string, unknown>;
  } catch (err) {
    console.error('⚠️ Error parseando JSON de lang:', err);
    return {};
  }
}

function filterEntitiesAndItems(langContent: Record<string, unknown>): {
  entities: Record<string, string>;
  items: Record<string, { name: string; desc: string }>;
} {
  const entities: Record<string, string> = {};
  const items: Record<string, { name: string; desc: string }> = {};

  for (const [key, value] of Object.entries(langContent)) {
    if (typeof value !== 'string') continue;

    if (key.startsWith('entity.cataclysm.') && !key.includes('.desc') && value.trim() !== '') {
      const entityId = key.replace('entity.cataclysm.', 'cataclysm:');
      entities[entityId] = value;
    } else if (
      key.startsWith('item.cataclysm.') &&
      !key.endsWith('.desc') &&
      !key.endsWith('.desc2')
    ) {
      const itemId = key.replace('item.cataclysm.', 'cataclysm:');
      const descKey = `${key}.desc`;
      const descValue =
        typeof langContent[descKey] === 'string' ? (langContent[descKey] as string) : '';
      items[itemId] = {
        name: value,
        desc: descValue,
      };
    }
  }

  return { entities, items };
}

async function testCataclysmExtraction() {
  const modsDir = String.raw`c:\Users\nacho\AppData\Roaming\.minecraft\mods`;
  const cataclysmJarName = findCataclysmJar(modsDir);

  if (!cataclysmJarName) {
    console.error('❌ No se encontró el .jar de Cataclysm');
    return;
  }

  const jarPath = path.join(modsDir, cataclysmJarName);
  console.log(`📦 Procesando de forma autónoma: ${cataclysmJarName}...`);

  const zip = new AdmZip(jarPath);
  const esLangContent = extractLangJson(zip);
  const { entities, items } = filterEntitiesAndItems(esLangContent);

  const result = {
    extracted_at: new Date().toISOString(),
    mod_id: 'cataclysm',
    jar_file: cataclysmJarName,
    total_entities: Object.keys(entities).length,
    total_items: Object.keys(items).length,
    entities,
    items,
  };

  const outputPath = path.resolve('data/cataclysm_standalone_extracted.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`✅ ¡Extracción completada con éxito!`);
  console.log(`📊 Entidades: ${result.total_entities} | Ítems/Armas: ${result.total_items}`);
  console.log(`📁 Guardado en: ${outputPath}`);
}

await testCataclysmExtraction().catch(console.error);
