import { supabase, searchModKnowledge } from './ragService.js';
import { buildPressAgentPrompt } from './prompts/pressAgentPrompt.js';
import { generateResilientLLMResponse } from './llmFallbackPipeline.js';
import dotenv from 'dotenv';

const initialNodeEnv = process.env.NODE_ENV;
dotenv.config({ override: true });
if (initialNodeEnv === 'test') {
  process.env.NODE_ENV = 'test';
}

const CONSTANTS = {
  FIELD_CREATED_AT: 'created_at',
  FIELD_ISSUE_NUMBER: 'issue_number',
  DEFAULT_AVATAR_URL: 'https://crystaltidessmp.net/images/ui/logo.webp',
  ANNOUNCEMENTS_FORUM_URL: 'https://crystaltidessmp.net/forum/announcements',
  TABLE_DISCORD_CHAT: 'discord_chat_stream',
  TABLE_AI_EVENTS: 'ai_event_stream',
  TABLE_NEWSPAPER_EDITIONS: 'ai_newspaper_editions',
  TABLE_FORUM_THREADS: 'forum_threads',
} as const;

const DISCORD_NEWS_WEBHOOK_URL =
  process.env.DISCORD_NEWS_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || '';

export interface GeneratedNewspaperEdition {
  id?: number;
  issue_number: number;
  issue_date: string;
  headline: string;
  front_page_summary: string;
  full_markdown: string;
  mvp_player_uuid?: string | null;
  likes_count?: number;
  created_at?: string;
  provider_used?: string;
}

interface DiscordChatMessageRow {
  message_id: string;
  reply_to_message_id: string | null;
  author_username: string;
  channel_name: string;
  content: string;
  created_at: string;
}

interface InGameEventRow {
  event_type: string;
  player_uuid: string | null;
  details: unknown;
  created_at: string;
}

interface NewspaperContext {
  discordGossipContext: string;
  inGameEventsContext: string;
  ragKnowledgeContext: string;
  ragMemeContext: string;
}

interface ParentAuthorMap {
  author: string;
  content: string;
}

/**
 * Recopila mapa de mensajes padres para responder a referencias en Discord
 */
async function fetchParentMessagesMap(replyIds: string[]): Promise<Map<string, ParentAuthorMap>> {
  const parentMap = new Map<string, ParentAuthorMap>();
  if (replyIds.length === 0) {
    return parentMap;
  }

  const { data: parentRows } = await supabase
    .from(CONSTANTS.TABLE_DISCORD_CHAT)
    .select('message_id, author_username, content')
    .in('message_id', replyIds);

  if (parentRows) {
    for (const parent of parentRows) {
      parentMap.set(parent.message_id, {
        author: parent.author_username,
        content: parent.content,
      });
    }
  }

  return parentMap;
}

/**
 * Formatea un mensaje de chat individual con su contexto de respuesta si aplica
 */
function formatDiscordMessage(
  message: DiscordChatMessageRow,
  parentMap: Map<string, ParentAuthorMap>,
): string {
  const parent = message.reply_to_message_id ? parentMap.get(message.reply_to_message_id) : null;
  if (parent) {
    return `[#${message.channel_name}] ${message.author_username}: "${message.content}" (↳ EN RESPUESTA A ${parent.author}: "${parent.content}")`;
  }
  return `[#${message.channel_name}] ${message.author_username}: "${message.content}"`;
}

/**
 * Obtiene el resumen de chismes recientes de Discord
 */
async function fetchDiscordGossipContext(): Promise<string> {
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  const { data: gossipRows } = await supabase
    .from(CONSTANTS.TABLE_DISCORD_CHAT)
    .select('message_id, reply_to_message_id, author_username, channel_name, content, created_at')
    .gte(CONSTANTS.FIELD_CREATED_AT, threeDaysAgo)
    .order(CONSTANTS.FIELD_CREATED_AT, { ascending: false })
    .limit(15);

  const rows = (gossipRows as DiscordChatMessageRow[] | null) ?? [];
  if (rows.length === 0) {
    return 'Sin actividad reciente relevante en Discord.';
  }

  const replyIds = rows.map((g) => g.reply_to_message_id).filter((id): id is string => Boolean(id));
  const parentMap = await fetchParentMessagesMap(replyIds);

  return rows.map((msg) => formatDiscordMessage(msg, parentMap)).join('\n');
}

/**
 * Obtiene eventos in-game recientes
 */
async function fetchInGameEventsContext(): Promise<string> {
  const { data: eventRows } = await supabase
    .from(CONSTANTS.TABLE_AI_EVENTS)
    .select('event_type, player_uuid, details, created_at')
    .order(CONSTANTS.FIELD_CREATED_AT, { ascending: false })
    .limit(10);

  const rows = (eventRows as InGameEventRow[] | null) ?? [];
  if (rows.length === 0) {
    return 'Sin eventos trágicos o épicos registrados en las últimas horas.';
  }

  return rows
    .map(
      (e) =>
        `[${e.event_type}] Jugador: ${e.player_uuid || 'Desconocido'} | Detalle: ${JSON.stringify(e.details)}`,
    )
    .join('\n');
}

/**
 * Obtiene contexto RAG de mecánicas y bosses
 */
async function fetchBossKnowledgeContext(): Promise<string> {
  const bossKnowledge = await searchModKnowledge('boss combate estructura dimension drops', 4);
  if (bossKnowledge.length === 0) {
    return 'Datos del modpack estándar.';
  }

  return bossKnowledge
    .map((k) => `[${k.mod_id}] ${k.entity_name} (${k.entity_type}): ${JSON.stringify(k.metadata)}`)
    .join('\n');
}

/**
 * Obtiene contexto RAG del catálogo de memes
 */
async function fetchMemeKnowledgeContext(): Promise<string> {
  const memeKnowledge = await searchModKnowledge('meme bardo fail epicidad', 3);
  if (memeKnowledge.length === 0) {
    return 'Catálogo de memes de la comunidad.';
  }

  return memeKnowledge
    .map((m) => `Meme: "${m.entity_name}" - Contexto: ${JSON.stringify(m.metadata)}`)
    .join('\n');
}

/**
 * Recopila contexto de Discord (#general / hilos 72h), eventos in-game y RAG de mods
 */
async function gatherNewspaperContext(): Promise<NewspaperContext> {
  const [discordGossipContext, inGameEventsContext, ragKnowledgeContext, ragMemeContext] =
    await Promise.all([
      fetchDiscordGossipContext(),
      fetchInGameEventsContext(),
      fetchBossKnowledgeContext(),
      fetchMemeKnowledgeContext(),
    ]);

  return {
    discordGossipContext,
    inGameEventsContext,
    ragKnowledgeContext,
    ragMemeContext,
  };
}

/**
 * Extrae el titular (H2 o primera línea) y el resumen de la edición generada
 */
function extractHeadlineAndSummary(markdownText: string): { headline: string; summary: string } {
  const lines = markdownText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  let headline = '🚨 EDICIÓN EXTRAORDINARIA DE CRYSTALTIDES SMP';
  let summary = 'Las últimas novedades del servidor de Minecraft.';

  for (const line of lines) {
    if (line.startsWith('## 🚨') || line.startsWith('## ') || line.startsWith('# ')) {
      headline = line.replace(/^#+\s*/, '').trim();
      break;
    }
  }

  const firstParagraph = lines.find((l) => !l.startsWith('#') && l.length > 20);
  if (firstParagraph) {
    const isTruncated = firstParagraph.length > 200;
    summary = firstParagraph.substring(0, 200) + (isTruncated ? '...' : '');
  }

  return { headline, summary };
}

/**
 * Construye la carga útil del Webhook de Discord
 */
function buildDiscordWebhookPayload(edition: GeneratedNewspaperEdition) {
  return {
    username: 'Periodista Amarillista 🗞️',
    avatar_url: CONSTANTS.DEFAULT_AVATAR_URL,
    embeds: [
      {
        title: `🗞️ Periódico CrystalTides - Edición #${edition.issue_number}`,
        description: `**${edition.headline}**\n\n${edition.front_page_summary}`,
        color: 0xef4444,
        fields: [
          {
            name: '🌐 Leer Edición Completa en el Foro',
            value: `[Ir al Foro de Anuncios](${CONSTANTS.ANNOUNCEMENTS_FORUM_URL})`,
            inline: false,
          },
        ],
        footer: {
          text: 'Edición Oficial • CrystalTides SMP',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Publica el periódico generado en el Webhook de Discord (#periodico)
 */
async function sendNewspaperToDiscordWebhook(edition: GeneratedNewspaperEdition): Promise<boolean> {
  if (!DISCORD_NEWS_WEBHOOK_URL) {
    console.warn('⚠️ DISCORD_NEWS_WEBHOOK_URL no configurada. Omitiendo envío a Discord.');
    return false;
  }

  try {
    const response = await fetch(DISCORD_NEWS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildDiscordWebhookPayload(edition)),
    });

    if (!response.ok) {
      console.warn(
        `⚠️ Error publicando en Discord webhook (${response.status}):`,
        await response.text(),
      );
      return false;
    }

    console.log(`✅ Edición #${edition.issue_number} publicada en Discord (#periodico).`);
    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Error enviando webhook de prensa a Discord:', errorMsg);
    return false;
  }
}

/**
 * Calcula el siguiente número de edición disponible
 */
async function resolveNextIssueNumber(): Promise<number> {
  const { data: lastEditions } = await supabase
    .from(CONSTANTS.TABLE_NEWSPAPER_EDITIONS)
    .select(CONSTANTS.FIELD_ISSUE_NUMBER)
    .order(CONSTANTS.FIELD_ISSUE_NUMBER, { ascending: false })
    .limit(1);

  const lastIssue = lastEditions?.[0]?.issue_number as number | undefined;
  return (lastIssue ?? 0) + 1;
}

/**
 * Sincroniza el hilo de anuncio oficial del periódico en el Foro Web
 */
async function syncForumAnnouncementThread(
  issueNumber: number,
  todayStr: string,
  headline: string,
  fullText: string,
): Promise<void> {
  try {
    const threadSlug = `edicion-${issueNumber}-${todayStr}`;
    await supabase.from(CONSTANTS.TABLE_FORUM_THREADS).upsert(
      {
        category_id: 1,
        user_id: 'press-bot',
        author_name: 'Prensa Oficial',
        author_avatar: CONSTANTS.DEFAULT_AVATAR_URL,
        author_role: 'staff',
        title: `🗞️ Edición #${issueNumber}: ${headline}`,
        content: fullText,
        slug: threadSlug,
        pinned: true,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    );
    console.log('📌 Hilo de anuncio creado exitosamente en el Foro Web.');
  } catch (threadErr) {
    console.warn('⚠️ No se pudo sincronizar el hilo en forum_threads:', threadErr);
  }
}

/**
 * Genera y persiste una nueva edición del Periódico Amarillista
 */
export async function generateNewspaperEdition(): Promise<GeneratedNewspaperEdition> {
  console.log('🗞️ Iniciando generación del Noticiero Amarillista...');

  const issueNumber = await resolveNextIssueNumber();
  const todayStr = new Date().toISOString().split('T')[0];
  const context = await gatherNewspaperContext();

  const systemPrompt = buildPressAgentPrompt({
    issueNumber,
    ...context,
  });

  const llmResult = await generateResilientLLMResponse({
    systemPrompt,
    userPrompt: `Genera la edición #${issueNumber} del Periódico Amarillista para la fecha ${todayStr}.`,
    temperature: 0.8,
  });

  const { headline, summary } = extractHeadlineAndSummary(llmResult.text);

  const editionRecord: GeneratedNewspaperEdition = {
    issue_number: issueNumber,
    issue_date: todayStr,
    headline,
    front_page_summary: summary,
    full_markdown: llmResult.text,
    provider_used: llmResult.provider,
  };

  const { data: savedData, error: dbErr } = await supabase
    .from(CONSTANTS.TABLE_NEWSPAPER_EDITIONS)
    .upsert(editionRecord, { onConflict: 'issue_date' })
    .select()
    .single();

  if (dbErr) {
    console.error('❌ Error guardando edición del periódico en Supabase:', dbErr.message);
  } else {
    console.log(`✨ Edición #${issueNumber} guardada exitosamente en Supabase.`);
  }

  await syncForumAnnouncementThread(issueNumber, todayStr, headline, llmResult.text);
  await sendNewspaperToDiscordWebhook(editionRecord);

  return (savedData as GeneratedNewspaperEdition | null) || editionRecord;
}
