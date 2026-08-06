import fs from 'node:fs'
import path from 'node:path'
import { createArticle, getAllArticles, updateArticle } from '../services/wikiService.js'

interface ManifestItem {
  modId: string
  name: string
  geoPath: string
  texturePath?: string
}

async function syncModelsToSupabase() {
  const manifestPath = path.resolve('../web-client/public/models/manifest.json')
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ No se encontró manifest.json en public/models/')
    return
  }

  const items: ManifestItem[] = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  console.log(`📦 Sincronizando ${items.length} modelos de manifest.json con Supabase wiki_articles...`)

  const existingArticles = await getAllArticles().catch(() => [])
  const existingSlugs = new Set(existingArticles.map(a => a.slug))

  let insertedCount = 0
  let updatedCount = 0

  for (const item of items) {
    const formattedName = item.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const slug = `bestiario-${item.modId}-${item.name}`.toLowerCase()
    
    // Normalizar separadores de path para URL web
    const modelUrl = `/models/${item.geoPath.replace(/\\/g, '/')}`
    const textureUrl = item.texturePath ? `/models/${item.texturePath.replace(/\\/g, '/')}` : undefined

    const articleData = {
      slug,
      title: `${formattedName} (${item.modId})`,
      content: `Ficha interactiva del Bestiario para la entidad **${formattedName}** del mod **${item.modId}**.`,
      description: `Modelo 3D y estadísticas de ${formattedName}.`,
      category: '🐉 Bestiario & Criaturas 3D',
      boss_mod_name: item.modId,
      model_3d_url: modelUrl,
      modelPath: modelUrl,
      texture_url: textureUrl,
      hp: '100 - 500',
      damage: 'Alta',
      location: 'Overworld / Mazmorras',
      drops: ['Items del Mod', 'KilluCoins']
    }

    if (existingSlugs.has(slug)) {
      const existing = existingArticles.find(a => a.slug === slug)
      if (existing && existing.id) {
        await updateArticle(existing.id, articleData).catch(err => console.error(`Error actualizando ${slug}:`, err))
        updatedCount++
      }
    } else {
      await createArticle(articleData).catch(err => console.error(`Error creando ${slug}:`, err))
      insertedCount++
    }
  }

  console.log(`\n🎉 Sincronización con Supabase completada!`)
  console.log(`✨ Nuevas fichas creadas: ${insertedCount}`)
  console.log(`🔄 Fichas actualizadas: ${updatedCount}`)
}

syncModelsToSupabase().catch(console.error)
