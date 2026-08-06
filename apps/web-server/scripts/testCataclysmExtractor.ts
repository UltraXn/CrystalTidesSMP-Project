import fs from 'node:fs'
import path from 'node:path'
import AdmZip from 'adm-zip'

async function testCataclysmExtraction() {
  const modsDir = String.raw`c:\Users\nacho\AppData\Roaming\.minecraft\mods`
  const files = fs.readdirSync(modsDir)
  const cataclysmJarName = files.find(f => f.toLowerCase().includes('cataclysm') && f.endsWith('.jar'))

  if (!cataclysmJarName) {
    console.error('❌ No se encontró el .jar de Cataclysm')
    return
  }

  const jarPath = path.join(modsDir, cataclysmJarName)
  console.log(`📦 Procesando de forma autónoma: ${cataclysmJarName}...`)

  const zip = new AdmZip(jarPath)
  const zipEntries = zip.getEntries()

  let esLangContent: Record<string, unknown> = {}
  
  // Buscar traducción es_es.json o en_us.json
  const esLangEntry = zipEntries.find(e => e.entryName === 'assets/cataclysm/lang/es_es.json')
  const enLangEntry = zipEntries.find(e => e.entryName === 'assets/cataclysm/lang/en_us.json')

  const targetEntry = esLangEntry || enLangEntry
  if (targetEntry) {
    try {
      const rawText = zip.readAsText(targetEntry)
      // Normalizar JSON limpiando posibles caracteres de control
      // eslint-disable-next-line no-control-regex
      esLangContent = JSON.parse(rawText.replace(/[\x00-\x1F]+/g, ' '))
    } catch (err) {
      console.error('⚠️ Error parseando JSON de lang:', err)
    }
  }

  // Filtrar entidades verdaderas e ítems con sus habilidades
  const entities: Record<string, string> = {}
  const items: Record<string, { name: string; desc: string }> = {}

  for (const [key, value] of Object.entries(esLangContent)) {
    if (typeof value !== 'string') continue

    if (key.startsWith('entity.cataclysm.') && !key.includes('.desc') && value.trim() !== '') {
      const entityId = key.replace('entity.cataclysm.', 'cataclysm:')
      entities[entityId] = value
    } else if (key.startsWith('item.cataclysm.') && !key.endsWith('.desc') && !key.endsWith('.desc2')) {
      const itemId = key.replace('item.cataclysm.', 'cataclysm:')
      const descKey = `${key}.desc`
      const descValue = typeof esLangContent[descKey] === 'string' ? (esLangContent[descKey] as string) : ''
      items[itemId] = {
        name: value,
        desc: descValue
      }
    }
  }

  const result = {
    extracted_at: new Date().toISOString(),
    mod_id: 'cataclysm',
    jar_file: cataclysmJarName,
    total_entities: Object.keys(entities).length,
    total_items: Object.keys(items).length,
    entities,
    items
  }

  const outputPath = path.resolve('data/cataclysm_standalone_extracted.json')
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8')

  console.log(`✅ ¡Extracción completada con éxito!`)
  console.log(`📊 Entidades: ${result.total_entities} | Ítems/Armas: ${result.total_items}`)
  console.log(`📁 Guardado en: ${outputPath}`)
}

await testCataclysmExtraction().catch(console.error)
