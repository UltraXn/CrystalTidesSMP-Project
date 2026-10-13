import dotenv from 'dotenv';

const initialNodeEnv = process.env.NODE_ENV;
dotenv.config({ override: true });
if (initialNodeEnv === 'test') {
  process.env.NODE_ENV = 'test';
}

export interface LLMOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export type LLMProvider = 'gemini' | 'groq' | 'openrouter' | 'local_template';

export interface LLMResult {
  text: string;
  provider: LLMProvider;
  model: string;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
}

interface ChatCompletionChoice {
  message?: {
    content?: string;
  };
}

interface ChatCompletionApiResponse {
  choices?: ChatCompletionChoice[];
}

const CONSTANTS = {
  DEFAULT_TEMPERATURE: 0.7,
  HEADER_CONTENT_TYPE: 'Content-Type',
  CONTENT_TYPE_JSON: 'application/json',
  PROVIDER_LOCAL: 'local_template' as const,
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  GROQ_URL: 'https://api.groq.com/openai/v1/chat/completions',
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
  GROQ_MODEL: 'llama-3.1-8b-instant',
  OPENROUTER_MODEL: 'meta-llama/llama-3.1-8b-instruct:free',
} as const;

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'] as const;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function getJsonHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  return {
    [CONSTANTS.HEADER_CONTENT_TYPE]: CONSTANTS.CONTENT_TYPE_JSON,
    ...extraHeaders,
  };
}

async function requestGeminiModel(
  model: string,
  apiKey: string,
  options: LLMOptions,
): Promise<string | null> {
  const url = `${CONSTANTS.GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${options.systemPrompt}\n\n${options.userPrompt}` }] },
      ],
      generationConfig: { temperature: options.temperature ?? CONSTANTS.DEFAULT_TEMPERATURE },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.warn(`⚠️ Gemini API (${model}) status ${response.status}:`, errBody.substring(0, 120));
    return null;
  }

  const data = (await response.json()) as GeminiApiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

/**
 * Nivel 1: Google Gemini API (gemini-2.0-flash con fallback a gemini-1.5-flash)
 */
async function callGemini(options: LLMOptions): Promise<LLMResult | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? '';
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const text = await requestGeminiModel(model, apiKey, options);
      if (text) {
        return { text, provider: 'gemini', model };
      }
    } catch (err) {
      console.warn(`⚠️ Gemini Fallback (${model}):`, getErrorMessage(err));
    }
  }

  return null;
}

async function postChatCompletion(
  url: string,
  apiKey: string,
  model: string,
  options: LLMOptions,
  customHeaders?: Record<string, string>,
): Promise<string | null> {
  const response = await fetch(url, {
    method: 'POST',
    headers: getJsonHeaders({
      Authorization: `Bearer ${apiKey}`,
      ...customHeaders,
    }),
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      temperature: options.temperature ?? CONSTANTS.DEFAULT_TEMPERATURE,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as ChatCompletionApiResponse;
  return data.choices?.[0]?.message?.content ?? null;
}

/**
 * Nivel 2: Groq API (llama-3.1-8b-instant)
 */
async function callGroq(options: LLMOptions): Promise<LLMResult | null> {
  const apiKey = process.env.GROQ_API_KEY ?? '';
  if (!apiKey) return null;

  try {
    const text = await postChatCompletion(
      CONSTANTS.GROQ_URL,
      apiKey,
      CONSTANTS.GROQ_MODEL,
      options,
    );
    if (!text) return null;

    return { text, provider: 'groq', model: CONSTANTS.GROQ_MODEL };
  } catch (err) {
    console.warn('⚠️ Groq Fallback:', getErrorMessage(err));
    return null;
  }
}

/**
 * Nivel 3: OpenRouter API (Free models)
 */
async function callOpenRouter(options: LLMOptions): Promise<LLMResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY ?? '';
  if (!apiKey) return null;

  try {
    const text = await postChatCompletion(
      CONSTANTS.OPENROUTER_URL,
      apiKey,
      CONSTANTS.OPENROUTER_MODEL,
      options,
      {
        'HTTP-Referer': 'https://crystaltidessmp.net',
        'X-Title': 'CrystalTides SMP AI',
      },
    );
    if (!text) return null;

    return { text, provider: 'openrouter', model: CONSTANTS.OPENROUTER_MODEL };
  } catch (err) {
    console.warn('⚠️ OpenRouter Fallback:', getErrorMessage(err));
    return null;
  }
}

function getQuestFallbackJson(): string {
  return JSON.stringify(
    {
      pacing_applied: 'BALANCED',
      world_modifier_recommendation: {
        name: 'Tranquilidad del Reino',
        effect: 'Doble experiencia al pescar y recolectar alimentos.',
      },
      quests: [
        {
          quest_type: 'EXPLORE',
          title: 'Exploración de la Frontera',
          description: 'Recorre 1000 bloques hacia el norte del mundo principal.',
          objectives: [{ target: 'distance_travelled', amount: 1000 }],
          reward_kc: 100,
        },
      ],
    },
    null,
    2,
  );
}

function getNewspaperFallbackMarkdown(): string {
  return `## 🚨 1. TITULAR SENSACIONALISTA
# ¡JORNADA TRANQUILA EN CRYSTALTIDES SMP!

## ⚔️ 2. CRÓNICA DE SANGRE Y BOSSES
Los aventureros se han replegado a sus bases para acumular recursos y afilar sus espadas.

## 🗣️ 3. EL CHISME DEL DISCORD
El chat de Discord se mantiene apacible mientras se preparan los próximos torneos.

## 🤡 4. EL MEME DE LA EDICIÓN
*This is fine 🔥☕* — Todo bajo control en la comunidad.

## 👑 5. FARÁNDULA Y JUGADOR MVP
Reconocimiento especial a todos los constructores y mineros activos de la jornada.`;
}

/**
 * Nivel 4: Template Local Fallback (Garantiza respuesta determinista en offline/red caída)
 */
function callLocalTemplateFallback(options: LLMOptions): LLMResult {
  const isQuest = options.systemPrompt.includes('Dungeon Master');
  if (isQuest) {
    return {
      text: getQuestFallbackJson(),
      provider: CONSTANTS.PROVIDER_LOCAL,
      model: 'deterministic_quest_template',
    };
  }

  return {
    text: getNewspaperFallbackMarkdown(),
    provider: CONSTANTS.PROVIDER_LOCAL,
    model: 'deterministic_newspaper_template',
  };
}

/**
 * Ejecuta la cadena de resiliencia Multi-LLM de 4 niveles
 */
export async function generateResilientLLMResponse(options: LLMOptions): Promise<LLMResult> {
  const geminiRes = await callGemini(options);
  if (geminiRes) return geminiRes;

  const groqRes = await callGroq(options);
  if (groqRes) return groqRes;

  const openRouterRes = await callOpenRouter(options);
  if (openRouterRes) return openRouterRes;

  console.warn('⚠️ Todos los proveedores LLM fallaron. Activando motor de plantilla local.');
  return callLocalTemplateFallback(options);
}
