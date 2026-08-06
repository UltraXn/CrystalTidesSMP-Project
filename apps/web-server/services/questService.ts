import { supabase, searchModKnowledge } from './ragService.js'
import { buildDungeonMasterPrompt, DungeonMasterOutput } from './prompts/dungeonMasterPrompt.js'
import { generateResilientLLMResponse } from './llmFallbackPipeline.js'

export interface DailyQuestItem {
  id?: number
  quest_date: string
  quest_type: 'HUNT' | 'CRAFT' | 'EXPLORE' | 'COMMERCE'
  title: string
  description: string
  objectives: Array<{ target: string; amount: number }>
  reward_kc: number
  expires_at: string
  created_at?: string
}

/**
 * Genera y guarda las misiones diarias del Dungeon Master
 */
export async function generateDailyQuests(): Promise<DailyQuestItem[]> {
  console.log('🎲 El Dungeon Master está generando las Misiones Diarias...')

  const todayStr = new Date().toISOString().split('T')[0]
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // 1. Obtener contexto RAG del modpack
  const modKnowledge = await searchModKnowledge('boss item estructura dungeon recompensa', 5)
  const ragContext = modKnowledge.length > 0
    ? modKnowledge.map(k => `[${k.mod_id}] ${k.entity_name} (${k.entity_type}): ${JSON.stringify(k.metadata)}`).join('\n')
    : 'Modpack estándar con Cataclysm, Mowzies Mobs y Deeper Darker.'

  // 2. Obtener resumen de eventos in-game recientes
  const { data: eventRows } = await supabase
    .from('ai_event_stream')
    .select('event_type, details')
    .order('created_at', { ascending: false })
    .limit(5)

  const worldEventsSummary = eventRows && eventRows.length > 0
    ? eventRows.map(e => `[${e.event_type}] ${JSON.stringify(e.details)}`).join('\n')
    : 'Mundo en paz relativa.'

  // 3. Construir System Prompt
  const systemPrompt = buildDungeonMasterPrompt(ragContext, worldEventsSummary)

  // 4. Consultar LLM Fallback Pipeline (estilo JSON)
  const llmResult = await generateResilientLLMResponse({
    systemPrompt,
    userPrompt: `Genera las misiones diarias para la fecha ${todayStr}. Responde estrictamente en formato JSON.`,
    temperature: 0.7
  })

  let parsedOutput: DungeonMasterOutput | null = null
  try {
    // Limpiar posibles bloques markdown ```json ... ```
    const cleanedJson = llmResult.text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim()
    parsedOutput = JSON.parse(cleanedJson)
  } catch (err) {
    console.warn('⚠️ Fallo parseando JSON del Dungeon Master, usando misiones de respaldo:', err instanceof Error ? err.message : String(err))
  }

  // Misiones de respaldo si el JSON fallara
  const fallbackQuests: DailyQuestItem[] = [
    {
      quest_date: todayStr,
      quest_type: 'HUNT',
      title: 'Desafío del Vacio Abisal',
      description: 'Derrota mobs del Nether y demuestra tu valía en combate.',
      objectives: [{ target: 'minecraft:wither_skeleton', amount: 5 }],
      reward_kc: 150,
      expires_at: expiresAt
    },
    {
      quest_date: todayStr,
      quest_type: 'EXPLORE',
      title: 'Exploración de Mazmorras Míticas',
      description: 'Adéntrate en una estructura legendaria del modpack.',
      objectives: [{ target: 'structure:ancient_city', amount: 1 }],
      reward_kc: 200,
      expires_at: expiresAt
    }
  ]

  const rawQuests = parsedOutput?.quests || []
  const questRecords: DailyQuestItem[] = rawQuests.length > 0
    ? rawQuests.map(q => ({
        quest_date: todayStr,
        quest_type: q.quest_type || 'HUNT',
        title: q.title || 'Misión del Dungeon Master',
        description: q.description || 'Cumple el objetivo encomendado por la IA.',
        objectives: q.objectives || [{ target: 'any', amount: 1 }],
        reward_kc: q.reward_kc || 100,
        expires_at: expiresAt
      }))
    : fallbackQuests

  // Limpiar misiones anteriores expiradas
  await supabase.from('ai_daily_quests').delete().lt('expires_at', new Date().toISOString())

  // Insertar nuevas misiones diarias en Supabase
  const { data: savedQuests, error: dbErr } = await supabase
    .from('ai_daily_quests')
    .insert(questRecords)
    .select()

  if (dbErr) {
    console.error('❌ Error guardando misiones diarias en Supabase:', dbErr.message)
  } else {
    console.log(`✨ Se registraron ${savedQuests?.length || questRecords.length} misiones diarias en Supabase.`)
  }

  return savedQuests || questRecords
}
