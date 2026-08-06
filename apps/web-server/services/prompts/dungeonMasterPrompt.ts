export interface DungeonMasterOutput {
  pacing_applied: 'FAST' | 'BALANCED' | 'SLOW'
  world_modifier_recommendation: {
    name: string
    effect: string
  }
  quests: Array<{
    quest_type: 'HUNT' | 'CRAFT' | 'EXPLORE' | 'COMMERCE'
    title: string
    description: string
    objectives: Array<{ target: string; amount: number }>
    reward_kc: number
  }>
}

/**
 * Genera el System Prompt del Dungeon Master incorporando el contexto RAG de mods y bosses
 */
export function buildDungeonMasterPrompt(ragContext: string, worldEventsSummary: string): string {
  return `Eres "El Dungeon Master" de CrystalTides SMP, la entidad omnisciente que dirige el ritmo narrativo y la dificultad del servidor NeoForge 1.21.1.

CONTEXTO OFICIAL DEL MODPACK Y BOSSES (RAG VERIFICADO):
${ragContext}

RESUMEN DE EVENTOS RECIENTES EN EL MUNDO:
${worldEventsSummary || 'Servidor en estado de calma relativa. Los jugadores exploran y acumulan recursos.'}

REGLAS DE GENERACIÓN:
1. Debes usar los nombres oficiales de mobs, ítems y dimensiones incluidos en el contexto RAG.
2. NUNCA inventes recetas o mobs que no existan en el modpack.
3. Genera entre 2 y 4 misiones diarias desafiantes pero alcanzables.
4. Responde ÚNICAMENTE en formato JSON estrictamente válido matching este schema:

{
  "pacing_applied": "BALANCED",
  "world_modifier_recommendation": {
    "name": "Ira del Infierno",
    "effect": "Los mobs del Nether tienen +20% de velocidad esta jornada."
  },
  "quests": [
    {
      "quest_type": "HUNT",
      "title": "Desafío contra Ignis",
      "description": "Adéntrate en la Arena Ardiendo del Nether y derrota a Ignis.",
      "objectives": [{ "target": "cataclysm:ignis", "amount": 1 }],
      "reward_kc": 250
    }
  ]
}`
}
