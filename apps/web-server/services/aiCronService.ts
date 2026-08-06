import cron from 'node-cron'
import { generateNewspaperEdition } from './newspaperService.js'
import { generateDailyQuests } from './questService.js'

/**
 * Ejecuta el pipeline completo de Inteligencia Artificial (Noticiero + Dungeon Master Quests)
 */
export async function executeDailyAIPipeline(): Promise<void> {
  console.log('⏰ [00:00 UTC] Ejecutando Pipeline Diario de Inteligencia Artificial (Crystal Intelligence Loop)...')
  try {
    const newspaper = await generateNewspaperEdition()
    console.log(`📰 Noticiero Amarillista Edición #${newspaper.issue_number} completado.`)

    const quests = await generateDailyQuests()
    console.log(`🎲 ${quests.length} Misiones Diarias del Dungeon Master completadas.`)

    console.log('✅ Pipeline Diario de Inteligencia Artificial finalizado con éxito.')
  } catch (err) {
    console.error('❌ Error en el Pipeline Diario de Inteligencia Artificial:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Inicia la tarea programada a las 00:00 UTC todos los días
 */
export function startAICronJobs(): void {
  // Cron Expression: 0 0 * * * (Todos los días a medianoche 00:00)
  cron.schedule('0 0 * * *', () => {
    executeDailyAIPipeline().catch(console.error)
  })

  console.log('📅 CronJob de Inteligencia Artificial activado (00:00 UTC diario).')
}
