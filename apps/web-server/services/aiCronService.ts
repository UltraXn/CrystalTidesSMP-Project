import cron from 'node-cron'
import { generateNewspaperEdition } from './newspaperService.js'
import { generateDailyQuests } from './questService.js'
import { generateAIBossPoll } from './aiPollService.js'

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
 * Inicia las tareas programadas de Inteligencia Artificial
 */
export function startAICronJobs(): void {
  // Cron Diario: 0 0 * * * (Todos los días a medianoche 00:00 UTC)
  cron.schedule('0 0 * * *', () => {
    executeDailyAIPipeline().catch(console.error)
  })

  // Cron Semanal de Encuesta de Jefes: 0 18 * * 5 (Viernes 18:00 UTC para el fin de semana)
  cron.schedule('0 18 * * 5', () => {
    console.log('🗳️ [Viernes 18:00 UTC] Generando Encuesta Comunitaria Semanal de Jefes Supremos con IA...')
    generateAIBossPoll().catch(console.error)
  })

  console.log('📅 CronJobs de Inteligencia Artificial activados (Diario 00:00 UTC + Viernes 18:00 UTC Encuesta de Jefes).')
}

