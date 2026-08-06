import fs from 'node:fs'
import path from 'node:path'
import AdmZip from 'adm-zip'

async function scanModels() {
  const modsDir = String.raw`c:\Users\nacho\AppData\Roaming\.minecraft\mods`
  const files = fs.readdirSync(modsDir).filter(f => f.endsWith('.jar'))

  console.log(`🔍 Escaneando ${files.length} mods .jar en búsqueda de modelos 3D...`)

  for (const file of files) {
    try {
      const zip = new AdmZip(path.join(modsDir, file))
      const entries = zip.getEntries()
      const geoEntries = entries.filter(e => 
        e.entryName.includes('/geo/') || 
        e.entryName.endsWith('.geo.json') || 
        e.entryName.endsWith('.gltf') || 
        e.entryName.endsWith('.glb') ||
        e.entryName.includes('/models/entity/')
      )

      if (geoEntries.length > 0) {
        console.log(`\n📦 Mod: ${file} (Encontrados: ${geoEntries.length} modelos)`)
        geoEntries.slice(0, 8).forEach(e => console.log(`   - ${e.entryName}`))
      }
    } catch (err) {
      // Ignorar zips corruptos
    }
  }
}

scanModels().catch(console.error)
