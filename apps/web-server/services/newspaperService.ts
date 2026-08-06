import { supabase, searchModKnowledge } from './ragService.js'
import { buildPressAgentPrompt } from './prompts/pressAgentPrompt.js'
import { generateResilientLLMResponse } from './llmFallbackPipeline.js'
import dotenv from 'dotenv'

const initialNodeEnv = process.env.NODE_ENV
dotenv.config({ override: true })
if (initialNodeEnv === 'test') {
  process.env.NODE_ENV = 'test'
}

const DISCORD_NEWS_WEBHOOK_URL = process.env.DISCORD_NEWS_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || ''

export interface GeneratedNewspaperEdition {
  id?: number
  issue_number: number
  issue_date: string
  headline: string
  front_page_summary: string
  full_markdown: string
  mvp_player_uuid?: string | null
  likes_count?: number
  created_at?: string
  provider_used?: string
}

/**
 * Recopila contexto de Discord (#general / hilos 72h), eventos in-game y RAG de mods
 */
async function gatherNewspaperContext(): Promise<{
  discordGossipContext: string
  inGameEventsContext: string
  ragKnowledgeContext: string
  ragMemeContext: string
}> {
  // 1. Chismes de Discord de las últimas 72 horas con Resolución de Hilos de Respuesta
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  const { data: gossipRows } = await supabase
    .from('discord_chat_stream')
    .select('message_id, reply_to_message_id, author_username, channel_name, content, created_at')
    .gte('created_at', threeDaysAgo)
    .order('created_at', { ascending: false })
    .limit(15)

  let discordGossipContext = 'Sin actividad reciente relevante en Discord.'
  if (gossipRows && gossipRows.length > 0) {
    // Mapear mensajes padres para respuestas
    const replyIds = gossipRows.map(g => g.reply_to_message_id).filter(Boolean) as string[]
    const parentMap = new Map<string, { author: string; content: string }>()

    if (replyIds.length > 0) {
      const { data: parentRows } = await supabase
        .from('discord_chat_stream')
        .select('message_id, author_username, content')
        .in('message_id', replyIds)

      if (parentRows) {
        parentRows.forEach(p => parentMap.set(p.message_id, { author: p.author_username, content: p.content }))
      }
    }

    discordGossipContext = gossipRows
      .map(g => {
        const parent = g.reply_to_message_id ? parentMap.get(g.reply_to_message_id) : null
        if (parent) {
          return `[#${g.channel_name}] ${g.author_username}: "${g.content}" (↳ EN RESPUESTA A ${parent.author}: "${parent.content}")`
        }
        return `[#${g.channel_name}] ${g.author_username}: "${g.content}"`
      })
      .join('\n')
  }

  // 2. Eventos in-game recientes (combates, logros, muertes de bosses)
  const { data: eventRows } = await supabase
    .from('ai_event_stream')
    .select('event_type, player_uuid, details, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  let inGameEventsContext = 'Sin eventos trágicos o épicos registrados en las últimas horas.'
  if (eventRows && eventRows.length > 0) {
    inGameEventsContext = eventRows
      .map(e => `[${e.event_type}] Jugador: ${e.player_uuid || 'Desconocido'} | Detalle: ${JSON.stringify(e.details)}`)
      .join('\n')
  }

  // 3. RAG de Mods y Mecánicas de Bosses
  const bossKnowledge = await searchModKnowledge('boss combate estructura dimension drops', 4)
  let ragKnowledgeContext = 'Datos del modpack estándar.'
  if (bossKnowledge.length > 0) {
    ragKnowledgeContext = bossKnowledge
      .map(k => `[${k.mod_id}] ${k.entity_name} (${k.entity_type}): ${JSON.stringify(k.metadata)}`)
      .join('\n')
  }

  // 4. Catálogo RAG de Memes Hispanos
  const memeKnowledge = await searchModKnowledge('meme bardo fail epicidad', 3)
  let ragMemeContext = 'Catálogo de memes de la comunidad.'
  if (memeKnowledge.length > 0) {
    ragMemeContext = memeKnowledge
      .map(m => `Meme: "${m.entity_name}" - Contexto: ${JSON.stringify(m.metadata)}`)
      .join('\n')
  }

  return {
    discordGossipContext,
    inGameEventsContext,
    ragKnowledgeContext,
    ragMemeContext
  }
}

/**
 * Extrae el titular (H2 o primera línea) y el resumen de la edición generada
 */
function extractHeadlineAndSummary(markdownText: string): { headline: string; summary: string } {
  const lines = markdownText.split('\n').map(l => l.trim()).filter(Boolean)
  let headline = '🚨 EDICIÓN EXTRAORDINARIA DE CRYSTALTIDES SMP'
  let summary = 'Las últimas novedades del servidor de Minecraft.'

  for (const line of lines) {
    if (line.startsWith('## 🚨') || line.startsWith('## ') || line.startsWith('# ')) {
      headline = line.replace(/^#+\s*/, '').trim()
      break
    }
  }

  const firstParagraph = lines.find(l => !l.startsWith('#') && l.length > 20)
  if (firstParagraph) {
    summary = firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '')
  }

  return { headline, summary }
}

/**
 * Publica el periódico generado en el Webhook de Discord (#periodico)
 */
async function sendNewspaperToDiscordWebhook(edition: GeneratedNewspaperEdition): Promise<boolean> {
  if (!DISCORD_NEWS_WEBHOOK_URL) {
    console.warn('⚠️ DISCORD_NEWS_WEBHOOK_URL no configurada. Omitiendo envío a Discord.')
    return false
  }

  try {
    const response = await fetch(DISCORD_NEWS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Periodista Amarillista 🗞️',
        avatar_url: 'https://crystaltidessmp.net/images/ui/logo.webp',
        embeds: [
          {
            title: `🗞️ Periódico CrystalTides - Edición #${edition.issue_number}`,
            description: `**${edition.headline}**\n\n${edition.front_page_summary}`,
            color: 0xef4444, // Rojo Amarillista
            fields: [
              {
                name: '🌐 Leer Edición Completa en el Foro',
                value: '[Ir al Foro de Anuncios](https://crystaltidessmp.net/forum/announcements)',
                inline: false
              }
            ],
            footer: {
              text: 'Edición Oficial • CrystalTides SMP'
            },
            timestamp: new Date().toISOString()
          }
        ]
      })
    })

    if (response.ok) {
      console.log(`✅ Edición #${edition.issue_number} publicada en Discord (#periodico).`)
      return true
    } else {
      console.warn(`⚠️ Error publicando en Discord webhook (${response.status}):`, await response.text())
      return false
    }
  } catch (err) {
    console.error('❌ Error enviando webhook de prensa a Discord:', err instanceof Error ? err.message : String(err))
    return false
  }
}

/**
 * Genera y persiste una nueva edición del Periódico Amarillista
 */
export async function generateNewspaperEdition(): Promise<GeneratedNewspaperEdition> {
  console.log('🗞️ Iniciando generación del Noticiero Amarillista...')

  // Obtener número de edición actual
  const { data: lastEditions } = await supabase
    .from('ai_newspaper_editions')
    .select('issue_number')
    .order('issue_number', { ascending: false })
    .limit(1)

  const issueNumber = (lastEditions?.[0]?.issue_number || 0) + 1
  const todayStr = new Date().toISOString().split('T')[0]

  // Recopilar contexto RAG + Discord + In-Game
  const context = await gatherNewspaperContext()

  // Construir System Prompt
  const systemPrompt = buildPressAgentPrompt({
    issueNumber,
    ...context
  })

  // Generar contenido narrativo mediante la Cadena de Resiliencia Multi-LLM
  const llmResult = await generateResilientLLMResponse({
    systemPrompt,
    userPrompt: `Genera la edición #${issueNumber} del Periódico Amarillista para la fecha ${todayStr}.`,
    temperature: 0.8
  })

  const { headline, summary } = extractHeadlineAndSummary(llmResult.text)

  const editionRecord: GeneratedNewspaperEdition = {
    issue_number: issueNumber,
    issue_date: todayStr,
    headline,
    front_page_summary: summary,
    full_markdown: llmResult.text,
    provider_used: llmResult.provider
  }

  // 1. Persistir en Supabase ai_newspaper_editions (upsert por fecha para idempotencia diaria)
  const { data: savedData, error: dbErr } = await supabase
    .from('ai_newspaper_editions')
    .upsert(editionRecord, { onConflict: 'issue_date' })
    .select()
    .single()

  if (dbErr) {
    console.error('❌ Error guardando edición del periódico en Supabase:', dbErr.message)
  } else {
    console.log(`✨ Edición #${issueNumber} guardada exitosamente en Supabase.`)
  }

  // 2. Crear Hilo Oficial de Anuncio en el Foro Web (categoría 1)
  try {
    const threadSlug = `edicion-${issueNumber}-${todayStr}`
    await supabase.from('forum_threads').upsert(
      {
        category_id: 1,
        user_id: 'press-bot',
        author_name: 'Prensa Oficial',
        author_avatar: 'https://crystaltidessmp.net/images/ui/logo.webp',
        author_role: 'staff',
        title: `🗞️ Edición #${issueNumber}: ${headline}`,
        content: llmResult.text,
        slug: threadSlug,
        pinned: true,
        created_at: new Date().toISOString()
      },
      { onConflict: 'slug' }
    )
    console.log(`📌 Hilo de anuncio creado exitosamente en el Foro Web.`)
  } catch (threadErr) {
    console.warn('⚠️ No se pudo sincronizar el hilo en forum_threads:', threadErr)
  }

  // 3. Publicar en Discord Webhook
  await sendNewspaperToDiscordWebhook(editionRecord)

  return savedData || editionRecord
}
