import { supabase, searchModKnowledge } from './ragService.js'
import { buildBossPollPrompt, BossPollOutput } from './prompts/bossPollPrompt.js'
import { generateResilientLLMResponse } from './llmFallbackPipeline.js'
import { createPoll } from './pollService.js'
import dotenv from 'dotenv'

const initialNodeEnv = process.env.NODE_ENV
dotenv.config({ override: true })
if (initialNodeEnv === 'test') {
  process.env.NODE_ENV = 'test'
}

const DISCORD_ANNOUNCEMENTS_WEBHOOK_URL =
  process.env.DISCORD_ANNOUNCEMENTS_WEBHOOK_URL ||
  process.env.DISCORD_NEWS_WEBHOOK_URL ||
  process.env.DISCORD_WEBHOOK_URL ||
  ''

/**
 * Genera una Encuesta de Jefes con IA basada en la actividad reciente del servidor y la publica
 */
export async function generateAIBossPoll(): Promise<{
  success: boolean
  poll?: Record<string, unknown>
  provider_used?: string
}> {
  try {
    // 1. Obtener conocimiento RAG de jefes y criaturas míticas
    let ragBossContext = 'Jefes oficiales: cataclysm:ignis, cataclysm:netherite_monstrosity, cataclysm:the_leviathan, mowziesmobs:frostmaw, mowziesmobs:barako'
    try {
      const ragResults = await searchModKnowledge('bosses criaturas legendarias cataclysm mowzies', 4)
      if (ragResults && ragResults.length > 0) {
        ragBossContext = ragResults.map(r => `[${r.entity_name} (${r.mod_id})] ${JSON.stringify(r.metadata)}`).join('\n')
      }
    } catch {
      // Usar fallback de ragBossContext
    }

    // 2. Obtener muertes recientes de bosses en las últimas 72 horas
    let recentKillsSummary = 'Sin actividad reciente de caza contra jefes.'
    try {
      const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
      const { data: kills } = await supabase
        .from('ai_event_stream')
        .select('player_uuid, details, created_at')
        .eq('event_type', 'boss_fight_kill')
        .gte('created_at', threeDaysAgo)
        .order('created_at', { ascending: false })
        .limit(8)

      if (kills && kills.length > 0) {
        recentKillsSummary = kills
          .map(k => {
            const d = (k.details as Record<string, unknown>) || {}
            const bossName = String(d.boss_name || d.boss_id || 'Desconocido')
            const playerName = String(d.player_name || 'Escuadrón')
            return `• Jefe derrotado: ${bossName} por ${playerName} (${new Date(k.created_at).toLocaleDateString()})`
          })
          .join('\n')
      }
    } catch {
      // Continuar con resumen estándar
    }

    // 3. Generar la encuesta con la Cadena Multi-LLM
    const systemPrompt = buildBossPollPrompt(ragBossContext, recentKillsSummary)
    const userPrompt = 'Analiza el estado del servidor y genera una encuesta semanal atractiva con 3 o 4 jefes distintos para el evento de Flash Bounty.'

    const llmResult = await generateResilientLLMResponse({
      systemPrompt,
      userPrompt,
      temperature: 0.6
    })

    let pollData: BossPollOutput
    try {
      const jsonMatch = llmResult.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        pollData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON structure found in LLM output')
      }
    } catch {
      // Fallback predeterminado si el JSON falla
      pollData = {
        title: '⚔️ Votación Semanal: ¿A qué Jefe Supremo liberamos?',
        question: 'Vota qué calamidad legendaria recibirá un multiplicador Flash Bounty (2.5x KC y drops legendarios) este fin de semana:',
        closes_in_days: 3,
        options: [
          { label: '🔥 Ignis (Cataclysm) - 2.5x KC & Espada del Vacío', boss_id: 'cataclysm:ignis', multiplier: '2.5x KC' },
          { label: '❄️ Frostmaw (Mowzie\'s Mobs) - 2.0x KC & Cristal Glacial', boss_id: 'mowziesmobs:frostmaw', multiplier: '2.0x KC' },
          { label: '🌊 The Leviathan (Cataclysm) - 3.0x KC & Escama Abisal', boss_id: 'cataclysm:the_leviathan', multiplier: '3.0x KC' },
          { label: '👑 Barako (Rey Solar) - 2.0x KC & Máscara Solar', boss_id: 'mowziesmobs:barako', multiplier: '2.0x KC' }
        ]
      }
    }

    // 4. Calcular fecha de cierre
    const closesAt = new Date(Date.now() + (pollData.closes_in_days || 3) * 24 * 60 * 60 * 1000).toISOString()

    // 5. Crear la encuesta en Supabase mediante pollService
    const createdPoll = await createPoll({
      title: pollData.title,
      question: pollData.question,
      options: pollData.options.map(o => o.label),
      closes_at: closesAt
    })

    // 6. Publicación opcional en Discord Webhook
    if (DISCORD_ANNOUNCEMENTS_WEBHOOK_URL && process.env.NODE_ENV !== 'test') {
      try {
        await fetch(DISCORD_ANNOUNCEMENTS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: pollData.title,
                description: `${pollData.question}\n\n**Opciones:**\n${pollData.options.map((o, idx) => `${idx + 1}. ${o.label}`).join('\n')}\n\n👉 ¡Vota ahora en https://crystaltidessmp.net o dentro del Launcher!`,
                color: 0xff4757,
                footer: { text: `Crystal Intelligence Loop • Cierra en ${pollData.closes_in_days} días` },
                timestamp: new Date().toISOString()
              }
            ]
          })
        })
      } catch (webhookErr) {
        console.warn('⚠️ No se pudo enviar encuesta de IA al webhook de Discord:', webhookErr)
      }
    }

    return {
      success: true,
      poll: createdPoll,
      provider_used: llmResult.provider
    }
  } catch (error) {
    console.error('Error generando encuesta de jefes por IA:', error)
    return {
      success: false
    }
  }
}
