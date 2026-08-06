import { describe, it, expect } from 'vitest'
import { verifyAndSanitizeKnowledgeQuery, ModKnowledgeItem } from '../services/ragService'

describe('RAG Adversarial & Anti-Hallucination Test Suite', () => {
  it('debe desmentir premisas falsas sobre ubicaciones de bosses (Ignis en nieve vs Nether)', () => {
    const mockContext: ModKnowledgeItem[] = [
      {
        mod_id: 'cataclysm',
        entity_type: 'boss',
        entity_name: 'Ignis',
        metadata: {
          health: 400,
          dimension: 'minecraft:the_nether',
          structure: 'cataclysm:burning_arena',
          description: 'Jefe Supremo del Nether que habita en la Arena Ardiendo.'
        }
      }
    ]

    const query = '¿El boss Ignis se encuentra en los biomas de nieve del Overworld?'
    const result = verifyAndSanitizeKnowledgeQuery(query, mockContext)

    expect(result.isSupported).toBe(true)
    expect(result.formattedContext).toContain('cataclysm:Ignis')
    expect(result.formattedContext).toContain('the_nether')
    // El contexto debe contener la dimensión real Nether para desmentir la pregunta trampa
    expect(result.formattedContext).not.toContain('snow')
  })

  it('debe rechazar y marcar como NO_KNOWLEDGE_FOUND recetas inventadas o preguntas trampa (Armadura de Netherite con Manzanas)', () => {
    const emptyContext: ModKnowledgeItem[] = []
    const query = '¿Cómo se craftea la armadura de Netherite usando manzanas de oro y diamantes?'

    const result = verifyAndSanitizeKnowledgeQuery(query, emptyContext)

    expect(result.isSupported).toBe(false)
    expect(result.formattedContext).toBe('NO_KNOWLEDGE_FOUND')
    expect(result.warningNote).toContain('No se encontraron datos oficiales')
  })

  it('debe recuperar correctamente ataques ambiguos de bosses (Rayo Solar de Barako)', () => {
    const mockContext: ModKnowledgeItem[] = [
      {
        mod_id: 'mowziesmobs',
        entity_type: 'boss',
        entity_name: 'Barako, el Rey Sol',
        metadata: {
          health: 150,
          drops: ['mowziesmobs:sol_gazer#100%'],
          description: 'Rey de la tribu Barakoa en la sabana. Lanza un continuo Rayo Solar (Sol-Gazer).'
        }
      }
    ]

    const query = '¿Qué hace el rayo solar?'
    const result = verifyAndSanitizeKnowledgeQuery(query, mockContext)

    expect(result.isSupported).toBe(true)
    expect(result.formattedContext).toContain('mowziesmobs:Barako')
    expect(result.formattedContext).toContain('Rayo Solar')
  })

  it('debe formatear el contexto recuperado en el estándar compacto TOON', () => {
    const mockContext: ModKnowledgeItem[] = [
      {
        mod_id: 'mowziesmobs',
        entity_type: 'boss',
        entity_name: 'Frostmaw',
        metadata: {
          health: 250,
          armor: 8,
          drops: ['mowziesmobs:ice_crystal#100%'],
          desc: 'Bestia mitica de las montanas heladas. Custodia el Cristal de Hielo.'
        }
      }
    ]

    const result = verifyAndSanitizeKnowledgeQuery('frostmaw', mockContext)

    expect(result.formattedContext).toMatch(/^knowledge\[entity\]:/)
    expect(result.formattedContext).toContain('mowziesmobs:Frostmaw|type:boss|hp:250|armor:8|')
  })
})
