import fs from 'node:fs'
import path from 'node:path'
import AdmZip from 'adm-zip'

const MODS_DIR = String.raw`c:\Users\nacho\AppData\Roaming\.minecraft\mods`
const OUTPUT_DIR = path.resolve('../web-client/public/models')

interface ExtractedAsset {
  modId: string
  name: string
  geoPath: string
  texturePath?: string
}

async function extractBossAssets() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.jar'))
  console.log(`📦 Procesando ${files.length} mods de Minecraft...`)

  const summary: ExtractedAsset[] = []

  for (const file of files) {
    try {
      const jarPath = path.join(MODS_DIR, file)
      const zip = new AdmZip(jarPath)
      const entries = zip.getEntries()

      // Buscar modelos .geo.json
      const geoEntries = entries.filter(e => e.entryName.endsWith('.geo.json'))

      for (const geoEntry of geoEntries) {
        const basename = path.basename(geoEntry.entryName)
        const nameWithoutExt = basename.replace('.geo.json', '')
        
        // Extraer modId desde el path 'assets/<modId>/...'
        const parts = geoEntry.entryName.split('/')
        const modId = parts.length > 1 && parts[0] === 'assets' ? parts[1] : 'custom'

        // Crear carpeta destino por modId
        const targetModDir = path.join(OUTPUT_DIR, modId)
        if (!fs.existsSync(targetModDir)) {
          fs.mkdirSync(targetModDir, { recursive: true })
        }

        // Guardar el .geo.json
        const targetGeoFile = path.join(targetModDir, `${nameWithoutExt}.geo.json`)
        fs.writeFileSync(targetGeoFile, geoEntry.getData())

        // Buscar si existe textura asociada en assets/<modId>/textures/entity/
        const textureEntry = entries.find(e => 
          e.entryName.includes(`/textures/entity/`) && 
          (e.entryName.includes(nameWithoutExt) || e.entryName.endsWith(`${nameWithoutExt}.png`))
        )

        let targetTextureFile: string | undefined
        if (textureEntry) {
          const texBasename = path.basename(textureEntry.entryName)
          targetTextureFile = path.join(targetModDir, texBasename)
          fs.writeFileSync(targetTextureFile, textureEntry.getData())
        }

        summary.push({
          modId,
          name: nameWithoutExt,
          geoPath: path.relative(OUTPUT_DIR, targetGeoFile),
          texturePath: targetTextureFile ? path.relative(OUTPUT_DIR, targetTextureFile) : undefined
        })
      }
    } catch (err) {
      // Ignorar zips no válidos
    }
  }

  // Guardar catálogo manifest en public/models/manifest.json
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.log(`\n🎉 Extracción completada!`)
  console.log(`📊 Total de modelos 3D (.geo.json) extraídos: ${summary.length}`)
  console.log(`📁 Catálogo generado en: ${manifestPath}`)
}

extractBossAssets().catch(console.error)
