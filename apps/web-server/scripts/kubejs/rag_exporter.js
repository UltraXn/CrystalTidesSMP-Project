/* global ServerEvents, Text, Utils, JsonIO, HTTP */
// KubeJS Server Script: Exporter RAG Automático para CrystalTides SMP
// Se ejecuta automáticamente al arrancar el servidor (ServerEvents.loaded) o mediante /export_rag_data

ServerEvents.loaded(event => {
  console.info('[Crystal RAG] Iniciando exportación automática de RAM al arrancar el servidor...')
  exportRagData(event.server)
})

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  event.register(
    Commands.literal('export_rag_data')
      .requires(src => src.hasPermission(2))
      .executes(ctx => {
        exportRagData(ctx.source.server)
        ctx.source.sendSuccess(Text.green('[Crystal RAG] Push enviado con exito hacia el servidor web.'), true)
        return 1
      })
  )
})

function exportRagData(_server) {
  let activeMods = new Set()
  let entities = []
  let items = []

  // 1. Recorrer la memoria RAM viva de EntityTypes
  Utils.registries.entityTypes.forEach(entityType => {
    let id = entityType.location.toString()
    let [modId, name] = id.split(':')
    
    if (modId) activeMods.add(modId)

    if (modId !== 'minecraft' || id.includes('wither') || id.includes('dragon')) {
      entities.push({
        id: id,
        mod: modId,
        name: entityType.description ? entityType.description.string : name,
        is_boss: id.includes('boss') || id.includes('dragon') || id.includes('wither') || id.includes('ignis')
      })
    }
  })

  // 2. Recorrer la memoria RAM viva de Items
  Utils.registries.items.forEach(item => {
    let id = item.location.toString()
    let [modId, name] = id.split(':')
    if (modId) activeMods.add(modId)

    if (modId !== 'minecraft') {
      items.push({
        id: id,
        mod: modId,
        name: item.description ? item.description.string : name
      })
    }
  })

  let payload = {
    exported_at: new Date().toISOString(),
    active_mods: Array.from(activeMods),
    total_entities: entities.length,
    total_items: items.length,
    entities: entities,
    items: items
  }

  // 3. Escribir respaldo TOON/JSON local
  JsonIO.write('kubejs/export/modpack_knowledge.json', payload)

  // 4. Push HTTP saliente por puerto 443 HTTPS hacia la API del servidor web
  try {
    HTTP.post('https://api.crystaltidessmp.net/api/rag/ingest', {
      headers: {
        'Content-Type': 'application/json',
        'x-rag-secret': 'CrystalRAGSecretKey2026'
      },
      body: JSON.stringify(payload)
    })
    console.info('[Crystal RAG] Push saliente enviado con éxito hacia https://api.crystaltidessmp.net/api/rag/ingest')
  } catch (err) {
    console.error('[Crystal RAG] Error enviando push saliente:', err)
  }
}
