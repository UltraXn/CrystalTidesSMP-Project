import { describe, it, expect } from 'vitest'
import { buildDungeonMasterPrompt } from '../services/prompts/dungeonMasterPrompt.js'
import { buildPressAgentPrompt } from '../services/prompts/pressAgentPrompt.js'
import { buildBossPollPrompt } from '../services/prompts/bossPollPrompt.js'
import { generateResilientLLMResponse } from '../services/llmFallbackPipeline.js'

describe('🧠 Intelligence Loop - Prompts & Resilient LLM Pipeline', () => {
  it('debe construir el System Prompt del Dungeon Master con el contexto RAG', () => {
    const ragContext = 'cataclysm:ignis|type:boss|hp:400|dimension:minecraft:the_nether'
    const worldEvents = 'Combate intenso en el Nether'

    const prompt = buildDungeonMasterPrompt(ragContext, worldEvents)

    expect(prompt).toContain('El Dungeon Master')
    expect(prompt).toContain('cataclysm:ignis')
    expect(prompt).toContain('Combate intenso en el Nether')
    expect(prompt).toContain('pacing_applied')
  })

  it('debe construir el System Prompt del Periodista Amarillista con 5 secciones obligatorias', () => {
    const prompt = buildPressAgentPrompt({
      issueNumber: 1,
      ragKnowledgeContext: 'cataclysm:ignis|type:boss|hp:400',
      ragMemeContext: 'Tiembla Elon Musk|Ideas grandiosas',
      discordGossipContext: 'Killu-Kirurin: ¿dónde está el profe?',
      inGameEventsContext: 'Derrota de Ignis a las 23:00'
    })

    expect(prompt).toContain('Periodista Amarillista')
    expect(prompt).toContain('## 🚨 1. TITULAR SENSACIONALISTA')
    expect(prompt).toContain('## ⚔️ 2. CRÓNICA DE SANGRE Y BOSSES')
    expect(prompt).toContain('## 🗣️ 3. EL CHISME DEL DISCORD')
    expect(prompt).toContain('## 🤡 4. EL MEME DE LA EDICIÓN')
    expect(prompt).toContain('## 👑 5. FARÁNDULA Y JUGADOR MVP')
  })

  it('debe construir el System Prompt de Encuesta de Jefes con opciones de Flash Bounty', () => {
    const ragContext = 'cataclysm:ignis|type:boss|mowziesmobs:frostmaw'
    const recentKills = 'Ignis derrotado ayer por 4 jugadores'

    const prompt = buildBossPollPrompt(ragContext, recentKills)

    expect(prompt).toContain('Oráculo de Calamidades')
    expect(prompt).toContain('cataclysm:ignis')
    expect(prompt).toContain('Flash Bounty')
    expect(prompt).toContain('closes_in_days')
    expect(prompt).toContain('options')
  })

  it('debe responder con el motor de plantilla local si falla o no hay API key de terceros', async () => {
    const result = await generateResilientLLMResponse({
      systemPrompt: 'Eres El Dungeon Master de CrystalTides SMP',
      userPrompt: 'Genera las misiones de hoy'
    })

    expect(result.text).toBeDefined()
    expect(result.provider).toBeDefined()
    expect(['gemini', 'groq', 'openrouter', 'local_template']).toContain(result.provider)
  })
})

