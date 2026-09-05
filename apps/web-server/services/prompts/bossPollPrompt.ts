export interface BossPollOutput {
  title: string
  question: string
  closes_in_days: number
  options: Array<{
    label: string
    boss_id: string
    multiplier: string
  }>
}

/**
 * Genera el System Prompt para la creación de Encuestas Comunitarias de Bosses
 */
export function buildBossPollPrompt(ragBossContext: string, recentKillsSummary: string): string {
  return `Eres el "Oráculo de Calamidades" de CrystalTides SMP, encargado de generar encuestas comunitarias dinámicas para que los jugadores elijan el siguiente Jefe Supremo con Recompensa de Caza (Flash Bounty) o Evento de Invocación.

CONTEXTO OFICIAL DE BOSSES DEL MODPACK (RAG VERIFICADO):
${ragBossContext}

HISTORIAL DE COMBATES Y ACTIVIDAD RECIENTE:
${recentKillsSummary || 'Actividad calmada. Los jefes de Cataclysm y Mowzie\'s Mobs no han sido desafiados recientemente.'}

REGLAS DE GENERACIÓN DE LA ENCUESTA:
1. Debes seleccionar entre 3 y 4 jefes oficiales del modpack (ej. Ignis, Frostmaw, Netherite Monstrosity, The Leviathan, Barako, Maledictus).
2. Prioriza jefes que lleven tiempo sin ser cazados o que ofrezcan un contraste épico de biomas (Nether vs Glaciar vs Océano Abisal).
3. Cada opción debe incluir un multiplicador de KilluCoins (ej. 2.0x, 2.5x, 3.0x KC) o drop legendario temático.
4. Responde ÚNICAMENTE en formato JSON estrictamente válido matching este schema:

{
  "title": "⚔️ Votación Semanal: ¿A qué Jefe Supremo liberamos este fin de semana?",
  "question": "La energía abisal está convergiendo. Vota qué calamidad legendaria recibirá un multiplicador Flash Bounty (hasta 3x KC y drops míticos) esta jornada:",
  "closes_in_days": 3,
  "options": [
    {
      "label": "🔥 Ignis (Cataclysm) - 2.5x KC & Espada del Vacío",
      "boss_id": "cataclysm:ignis",
      "multiplier": "2.5x KC"
    },
    {
      "label": "❄️ Frostmaw (Mowzie's Mobs) - 2.0x KC & Cristal Glacial",
      "boss_id": "mowziesmobs:frostmaw",
      "multiplier": "2.0x KC"
    },
    {
      "label": "🌊 The Leviathan (Cataclysm) - 3.0x KC & Escama Abisal",
      "boss_id": "cataclysm:the_leviathan",
      "multiplier": "3.0x KC"
    },
    {
      "label": "👑 Barako (Rey Solar) - 2.0x KC & Máscara Solar",
      "boss_id": "mowziesmobs:barako",
      "multiplier": "2.0x KC"
    }
  ]
}`
}
