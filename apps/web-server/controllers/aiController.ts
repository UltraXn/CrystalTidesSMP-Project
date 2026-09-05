import { Request, Response } from 'express'
import { supabase } from '../services/ragService.js'
import { generateNewspaperEdition } from '../services/newspaperService.js'
import { generateDailyQuests } from '../services/questService.js'
import { executeDailyAIPipeline } from '../services/aiCronService.js'
import { generateAIBossPoll } from '../services/aiPollService.js'

/**
 * GET /api/ai/newspaper/latest
 * Retorna la última edición del Periódico Amarillista
 */
export async function getLatestNewspaper(req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('ai_newspaper_editions')
      .select('*')
      .order('issue_number', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      res.status(404).json({ message: 'No hay ediciones del periódico disponibles todavía.' })
      return
    }

    res.json(data[0])
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * GET /api/ai/newspaper/archive
 * Retorna la hemeroteca de ediciones anteriores
 */
export async function getNewspaperArchive(req: Request, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('ai_newspaper_editions')
      .select('id, issue_number, issue_date, headline, front_page_summary, likes_count, created_at', { count: 'exact' })
      .order('issue_number', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.json({ editions: data || [], total: count || 0, page, limit })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * POST /api/ai/newspaper/:id/like
 * Incrementa el contador de likes real de una edición en Supabase
 */
export async function likeNewspaperEdition(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (!id) {
      res.status(400).json({ error: 'ID de edición inválido' })
      return
    }

    const { data: current } = await supabase
      .from('ai_newspaper_editions')
      .select('likes_count')
      .eq('id', id)
      .single()

    const newLikes = (current?.likes_count || 0) + 1

    const { data, error } = await supabase
      .from('ai_newspaper_editions')
      .update({ likes_count: newLikes })
      .eq('id', id)
      .select('id, likes_count')
      .single()

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.json({ success: true, likes_count: data?.likes_count || newLikes })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * POST /api/ai/generate-newspaper (Admin)
 * Genera una nueva edición bajo demanda
 */
export async function triggerNewspaperGeneration(req: Request, res: Response): Promise<void> {
  try {
    const edition = await generateNewspaperEdition()
    res.json({ message: 'Edición del periódico generada con éxito.', edition })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * GET /api/ai/quests/daily
 * Retorna las misiones diarias vigentes del Dungeon Master
 */
export async function getDailyQuests(req: Request, res: Response): Promise<void> {
  try {
    const todayStr = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('ai_daily_quests')
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .order('id', { ascending: true })

    if (error || !data || data.length === 0) {
      // Si no hay misiones para hoy, intentar generar o retornar fallback
      const quests = await generateDailyQuests()
      res.json(quests)
      return
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * POST /api/ai/generate-quests (Admin)
 * Fuerza la regeneración de las misiones diarias del Dungeon Master
 */
export async function triggerQuestsGeneration(req: Request, res: Response): Promise<void> {
  try {
    const quests = await generateDailyQuests()
    res.json({ message: 'Misiones diarias del Dungeon Master generadas con éxito.', quests })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * POST /api/ai/trigger-pipeline (Admin)
 * Ejecuta manualmente todo el pipeline diario (Noticiero + Quests)
 */
export async function triggerFullPipeline(req: Request, res: Response): Promise<void> {
  try {
    await executeDailyAIPipeline()
    res.json({ message: 'Pipeline diario de IA ejecutado correctamente.' })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

/**
 * POST /api/ai/generate-boss-poll (Admin)
 * Genera una encuesta comunitaria semanal de Jefes Supremos con IA
 */
export async function triggerBossPollGeneration(req: Request, res: Response): Promise<void> {
  try {
    const result = await generateAIBossPoll()
    if (!result.success) {
      res.status(500).json({ error: 'No se pudo generar la encuesta de jefes por IA.' })
      return
    }
    res.json({ message: 'Encuesta comunitaria de Jefes generada con éxito.', result })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
  }
}

