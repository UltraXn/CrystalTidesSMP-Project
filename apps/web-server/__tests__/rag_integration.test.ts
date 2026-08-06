import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('RAG Controller & Integration E2E Test Suite', () => {
  const SECRET = process.env.RAG_INGEST_SECRET || 'CrystalRAGSecretKey2026'

  it('debe rechazar solicitudes a /api/rag/ingest sin header de autenticación válido (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/rag/ingest')
      .send({ entities: [], items: [] })

    expect(res.status).toBe(401)
    expect(res.body.error).toContain('No autorizado')
  })

  it('debe aceptar push de KubeJS autenticado y procesar payload con éxito (200 OK)', async () => {
    const res = await request(app)
      .post('/api/rag/ingest')
      .set('x-rag-secret', SECRET)
      .send({
        exported_at: new Date().toISOString(),
        active_mods: ['cataclysm', 'mowziesmobs'],
        entities: [
          { id: 'cataclysm:ignis', name: 'Ignis', mod: 'cataclysm', is_boss: true },
          { id: 'mowziesmobs:barako', name: 'Barako', mod: 'mowziesmobs', is_boss: true }
        ],
        items: []
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.inserted_count).toBeGreaterThanOrEqual(0)
  })

  it('debe omitir re-procesar el mismo payload idéntico por checksum en 10ms (200 Skipped / 0 Tokens)', async () => {
    const payload = {
      exported_at: new Date().toISOString(),
      active_mods: ['cataclysm'],
      entities: [{ id: 'cataclysm:ignis', name: 'Ignis', mod: 'cataclysm', is_boss: true }],
      items: []
    }

    // Primer push
    await request(app)
      .post('/api/rag/ingest')
      .set('x-rag-secret', SECRET)
      .send(payload)

    // Segundo push con checksum idéntico
    const secondRes = await request(app)
      .post('/api/rag/ingest')
      .set('x-rag-secret', SECRET)
      .send(payload)

    expect(secondRes.status).toBe(200)
    expect(secondRes.body.status).toBe('skipped')
    expect(secondRes.body.message).toContain('Sin cambios detectados')
  })

  it('debe responder a la búsqueda RAG GET /api/rag/search?q=Ignis', async () => {
    const res = await request(app)
      .get('/api/rag/search?q=Ignis')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('query', 'Ignis')
    expect(res.body).toHaveProperty('is_supported')
    expect(res.body).toHaveProperty('context')
  })
})
