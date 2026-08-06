import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import dotenv from 'dotenv'
import AdmZip from 'adm-zip'

dotenv.config({ override: true })

import { supabase, generateEmbedding } from '../services/ragService.js'

const DEFAULT_MODS_PATH = String.raw`c:\Users\nacho\Desktop\Servidor Testeo (maqueta)\mods`
const MODS_DIR = process.env.MINECRAFT_MODS_DIR || (fs.existsSync(DEFAULT_MODS_PATH) ? DEFAULT_MODS_PATH : String.raw`c:\Users\nacho\AppData\Roaming\.minecraft\mods`)

interface BossMechanicItem {
  id: string
  mod_id: string
  name: string
  type: string
  hp: number
  armor: number
  dimension: string
  structure: string
  phases: number
  weaknesses: string
  drops: string[]
  description: string
}

/**
 * Calcula el hash SHA256 de un archivo .jar para el control Delta Incremental
 */
function getFileSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(fileBuffer).digest('hex')
}

/**
 * Parsea el archivo de mecánicas en formato TOON (boss_mechanics_knowledge.toon)
 */
function parseBossMechanicsToon(): BossMechanicItem[] {
  const toonPath = path.resolve('data/boss_mechanics_knowledge.toon')
  if (!fs.existsSync(toonPath)) return []

  const content = fs.readFileSync(toonPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('bosses['))

  return lines.map(line => {
    const parts = line.trim().split('|')
    return {
      id: parts[0],
      mod_id: parts[1],
      name: parts[2],
      type: parts[3],
      hp: Number.parseInt(parts[4], 10) || 0,
      armor: Number.parseInt(parts[5], 10) || 0,
      dimension: parts[6],
      structure: parts[7],
      phases: Number.parseInt(parts[8], 10) || 1,
      weaknesses: parts[9],
      drops: parts[10] ? parts[10].split(',') : [],
      description: parts[11] || ''
    }
  })
}

interface MemeCatalogItem {
  id: string
  name: string
  trigger_context: string
}

/**
 * Parsea el catálogo de memes en formato TOON (memesCatalog.toon)
 */
function parseMemesCatalogToon(): MemeCatalogItem[] {
  const toonPath = path.resolve('data/memesCatalog.toon')
  if (!fs.existsSync(toonPath)) return []

  const content = fs.readFileSync(toonPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('memes['))

  return lines.map(line => {
    const parts = line.trim().split('|')
    return {
      id: parts[0] || '',
      name: parts[1] || '',
      trigger_context: parts[2] || ''
    }
  }).filter(m => m.name && m.trigger_context)
}

/**
 * Extrae las traducciones de un .jar y retorna entidades e ítems parseados
 */
function extractLangFromJar(zip: AdmZip, modId: string): {
  entities: Record<string, string>
  items: Record<string, { name: string; desc: string }>
} {
  const entries = zip.getEntries()
  const esLang = entries.find(e => e.entryName.includes('/lang/es_es.json'))
  const enLang = entries.find(e => e.entryName.includes('/lang/en_us.json'))
  const targetLang = esLang || enLang

  const langData = parseLangJson(zip, targetLang, modId)
  return classifyLangEntries(langData, modId)
}

function parseLangJson(zip: AdmZip, entry: ReturnType<AdmZip['getEntries']>[number] | undefined, modId: string): Record<string, string> {
  if (!entry) return {}
  try {
    const rawText = zip.readFile(entry)?.toString('utf-8') ?? ''
    // eslint-disable-next-line no-control-regex
    return JSON.parse(rawText.replace(/[\x00-\x1f]+/g, ' '))
  } catch (err) {
    console.warn(`\u26a0\ufe0f JSON parse fallback para ${modId}:`, err instanceof Error ? err.message : String(err))
    return {}
  }
}

function classifyLangEntries(langData: Record<string, string>, modId: string): {
  entities: Record<string, string>
  items: Record<string, { name: string; desc: string }>
} {
  const entities: Record<string, string> = {}
  const items: Record<string, { name: string; desc: string }> = {}

  for (const [k, v] of Object.entries(langData)) {
    if (typeof v !== 'string' || !v.trim()) continue

    if (k.startsWith('entity.') && !k.endsWith('.desc')) {
      entities[k.replace(/^entity\.[^.]+\./, `${modId}:`)] = v
    } else if (k.startsWith('item.') && !k.endsWith('.desc') && !k.endsWith('.desc2')) {
      const descKey = `${k}.desc`
      items[k.replace(/^item\.[^.]+\./, `${modId}:`)] = {
        name: v,
        desc: typeof langData[descKey] === 'string' ? langData[descKey] : ''
      }
    }
  }

  return { entities, items }
}

/**
 * Inserta las entidades extraídas de un .jar en Supabase con embeddings vectoriales
 */
async function ingestJarEntities(
  modId: string,
  file: string,
  entities: Record<string, string>
): Promise<number> {
  let count = 0
  for (const [entityId, entityName] of Object.entries(entities)) {
    const embedding = await generateEmbedding(`${entityId} ${entityName} ${modId}`)
    await supabase.from('mod_knowledge_base').insert({
      mod_id: modId,
      entity_type: 'mob',
      entity_name: entityName,
      metadata: { entity_id: entityId, mod_file: file },
      embedding
    })
    count++
  }
  return count
}

async function runModpackIngestion() {
  console.log('🚀 Iniciando Ingestión RAG Multicapa de Mods...')

  if (!fs.existsSync(MODS_DIR)) {
    console.error(`❌ La carpeta de mods no existe: ${MODS_DIR}`)
    return
  }

  const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.jar'))
  console.log(`📦 Encontrados ${files.length} archivos .jar en ${MODS_DIR}`)

  // 1. Cargar manifiesto de mods ya procesados (Delta Incremental)
  const { data: existingManifest } = await supabase
    .from('processed_mods_manifest')
    .select('mod_file, file_hash')

  const manifestMap = new Map<string, string>()
  if (existingManifest) {
    existingManifest.forEach(m => manifestMap.set(m.mod_file, m.file_hash))
  }

  let newModsProcessed = 0
  let skippedMods = 0
  let totalEntitiesSaved = 0

  // 2. Procesar cada archivo .jar (Delta Incremental en memoria Buffer)
  for (const file of files) {
    const filePath = path.join(MODS_DIR, file)
    const fileHash = getFileSha256(filePath)

    if (manifestMap.get(file) === fileHash) {
      skippedMods++
      continue
    }

    console.log(`⏳ Procesando nuevo/modificado .jar: ${file}...`)
    const modId = file.toLowerCase().split('-')[0].replace(/[^a-z0-9_]/g, '')
    const zip = new AdmZip(filePath)
    const { entities } = extractLangFromJar(zip, modId)

    totalEntitiesSaved += await ingestJarEntities(modId, file, entities)

    await supabase.from('processed_mods_manifest').upsert({
      mod_file: file,
      file_hash: fileHash,
      processed_at: new Date().toISOString()
    })

    newModsProcessed++
  }

  // 3. Procesar catálogo de mecánicas en formato TOON (boss_mechanics_knowledge.toon)
  const bossMechanics = parseBossMechanicsToon()
  console.log(`🐉 Ingestando ${bossMechanics.length} mecánicas de bosses en formato TOON...`)

  for (const boss of bossMechanics) {
    const textToEmbed = `${boss.id} ${boss.name} ${boss.description} ${boss.weaknesses} ${boss.drops.join(' ')}`
    const embedding = await generateEmbedding(textToEmbed)

    await supabase.from('mod_knowledge_base').insert({
      mod_id: boss.mod_id,
      entity_type: 'boss_mechanic',
      entity_name: boss.name,
      metadata: boss,
      embedding
    })
    totalEntitiesSaved++
  }

  // 4. Procesar catálogo de memes hispanos en formato TOON (memesCatalog.toon)
  const memes = parseMemesCatalogToon()
  console.log(`🤡 Ingestando ${memes.length} memes hispanos del catálogo TOON...`)

  for (const meme of memes) {
    const textToEmbed = `meme ${meme.name} ${meme.trigger_context}`
    const embedding = await generateEmbedding(textToEmbed)

    await supabase.from('mod_knowledge_base').insert({
      mod_id: 'crystaltides_memes',
      entity_type: 'meme',
      entity_name: meme.name,
      metadata: { meme_id: meme.id, trigger_context: meme.trigger_context },
      embedding
    })
    totalEntitiesSaved++
  }

  console.log('✅ ¡Ingestión RAG de Mods y Memes finalizada exitosamente!')
  console.log(`📊 Mods nuevos procesados: ${newModsProcessed} | Omitidos sin cambios: ${skippedMods}`)
  console.log(`✨ Total registros ingresados/actualizados: ${totalEntitiesSaved}`)
}

await runModpackIngestion().catch(console.error)
