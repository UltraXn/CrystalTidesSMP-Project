import dotenv from 'dotenv'

const initialNodeEnv = process.env.NODE_ENV
dotenv.config({ override: true })
if (initialNodeEnv === 'test') {
  process.env.NODE_ENV = 'test'
}

export interface LLMOptions {
  systemPrompt: string
  userPrompt: string
  temperature?: number
}

export interface LLMResult {
  text: string
  provider: 'gemini' | 'groq' | 'openrouter' | 'local_template'
  model: string
}

/**
 * Nivel 1: Google Gemini API (gemini-2.0-flash con fallback a gemini-1.5-flash)
 */
async function callGemini(options: LLMOptions): Promise<LLMResult | null> {
  const apiKey = process.env.GEMINI_API_KEY || ''
  if (!apiKey) return null

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${options.systemPrompt}\n\n${options.userPrompt}` }] }
          ],
          generationConfig: { temperature: options.temperature ?? 0.7 }
        })
      })

      if (!response.ok) {
        const errBody = await response.text()
        console.warn(`⚠️ Gemini API (${model}) status ${response.status}:`, errBody.substring(0, 120))
        continue // Intentar con el siguiente modelo de Gemini
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        return { text, provider: 'gemini', model }
      }
    } catch (err) {
      console.warn(`⚠️ Gemini Fallback (${model}):`, err instanceof Error ? err.message : String(err))
    }
  }
  return null
}

/**
 * Nivel 2: Groq API (llama-3.1-8b-instant)
 */
async function callGroq(options: LLMOptions): Promise<LLMResult | null> {
  const apiKey = process.env.GROQ_API_KEY || ''
  if (!apiKey) return null
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ],
        temperature: options.temperature ?? 0.7
      })
    })

    if (!response.ok) return null
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) return null

    return { text, provider: 'groq', model: 'llama-3.1-8b-instant' }
  } catch (err) {
    console.warn('⚠️ Groq Fallback:', err instanceof Error ? err.message : String(err))
    return null
  }
}

/**
 * Nivel 3: OpenRouter API (Free models)
 */
async function callOpenRouter(options: LLMOptions): Promise<LLMResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY || ''
  if (!apiKey) return null
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://crystaltidessmp.net',
        'X-Title': 'CrystalTides SMP AI'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ],
        temperature: options.temperature ?? 0.7
      })
    })

    if (!response.ok) return null
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) return null

    return { text, provider: 'openrouter', model: 'meta-llama/llama-3.1-8b-instruct:free' }
  } catch (err) {
    console.warn('⚠️ OpenRouter Fallback:', err instanceof Error ? err.message : String(err))
    return null
  }
}

/**
 * Nivel 4: Template Local Fallback (Garantiza respuesta determinista en offline/red caída)
 */
function callLocalTemplateFallback(options: LLMOptions): LLMResult {
  const isQuest = options.systemPrompt.includes('Dungeon Master')
  if (isQuest) {
    const defaultQuestJson = JSON.stringify({
      pacing_applied: 'BALANCED',
      world_modifier_recommendation: {
        name: 'Tranquilidad del Reino',
        effect: 'Doble experiencia al pescar y recolectar alimentos.'
      },
      quests: [
        {
          quest_type: 'EXPLORE',
          title: 'Exploración de la Frontera',
          description: 'Recorre 1000 bloques hacia el norte del mundo principal.',
          objectives: [{ target: 'distance_travelled', amount: 1000 }],
          reward_kc: 100
        }
      ]
    }, null, 2)

    return { text: defaultQuestJson, provider: 'local_template', model: 'deterministic_quest_template' }
  }

  const defaultNewspaperMarkdown = `## 🚨 1. TITULAR SENSACIONALISTA
# ¡JORNADA TRANQUILA EN CRYSTALTIDES SMP!

## ⚔️ 2. CRÓNICA DE SANGRE Y BOSSES
Los aventureros se han replegado a sus bases para acumular recursos y afilar sus espadas.

## 🗣️ 3. EL CHISME DEL DISCORD
El chat de Discord se mantiene apacible mientras se preparan los próximos torneos.

## 🤡 4. EL MEME DE LA EDICIÓN
*This is fine 🔥☕* — Todo bajo control en la comunidad.

## 👑 5. FARÁNDULA Y JUGADOR MVP
Reconocimiento especial a todos los constructores y mineros activos de la jornada.`

  return { text: defaultNewspaperMarkdown, provider: 'local_template', model: 'deterministic_newspaper_template' }
}

/**
 * Ejecuta la cadena de resiliencia Multi-LLM de 4 niveles
 */
export async function generateResilientLLMResponse(options: LLMOptions): Promise<LLMResult> {
  // Nivel 1: Gemini
  const geminiRes = await callGemini(options)
  if (geminiRes) return geminiRes

  // Nivel 2: Groq
  const groqRes = await callGroq(options)
  if (groqRes) return groqRes

  // Nivel 3: OpenRouter
  const openRouterRes = await callOpenRouter(options)
  if (openRouterRes) return openRouterRes

  // Nivel 4: Fallback local determinista
  console.warn('⚠️ Todos los proveedores LLM fallaron. Activando motor de plantilla local.')
  return callLocalTemplateFallback(options)
}
