import { Request, Response } from 'express';
import { supabase } from '../services/ragService.js';
import { generateNewspaperEdition } from '../services/newspaperService.js';
import { generateDailyQuests } from '../services/questService.js';
import { executeDailyAIPipeline } from '../services/aiCronService.js';
import { generateAIBossPoll } from '../services/aiPollService.js';

const TABLE_NEWSPAPER = 'ai_newspaper_editions';
const TABLE_DAILY_QUESTS = 'ai_daily_quests';

interface LikeResult {
  liked: boolean;
  likes_count: number;
}

/**
 * Helper para estandarizar las respuestas de error
 */
const sendErrorResponse = (res: Response, err: unknown, status = 500): void => {
  if (status >= 500) {
    console.error('[AIController] Internal error:', err);
  }
  let safeMessage = 'Internal server error';
  if (status < 500) {
    safeMessage = err instanceof Error ? err.message : String(err);
  }
  res.status(status).json({ error: safeMessage });
};

/**
 * GET /api/ai/newspaper/latest
 * Retorna la última edición del Periódico Amarillista
 */
export async function getLatestNewspaper(req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NEWSPAPER)
      .select('*')
      .order('issue_number', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      res.status(404).json({ message: 'No hay ediciones del periódico disponibles todavía.' });
      return;
    }

    res.json(data[0]);
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}

/**
 * GET /api/ai/newspaper/archive
 * Retorna la hemeroteca de ediciones anteriores
 */
export async function getNewspaperArchive(req: Request, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from(TABLE_NEWSPAPER)
      .select(
        'id, issue_number, issue_date, headline, front_page_summary, likes_count, created_at',
        { count: 'exact' },
      )
      .order('issue_number', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      sendErrorResponse(res, error);
      return;
    }

    res.json({ editions: data ?? [], total: count ?? 0, page, limit });
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}

/**
 * POST /api/ai/newspaper/:id/like
 * Registra el like del usuario (uno por edición) e incrementa el contador de forma atómica
 */
export async function likeNewspaperEdition(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ error: 'ID de edición inválido' });
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { data, error } = await supabase.rpc('like_newspaper_edition', {
      p_edition_id: id,
      p_user_id: req.user.id,
    });

    if (error) {
      sendErrorResponse(res, error);
      return;
    }

    const rows = (data ?? []) as LikeResult[];
    if (rows.length === 0) {
      res.status(404).json({ error: 'Edición no encontrada' });
      return;
    }

    res.json({ success: true, liked: rows[0].liked, likes_count: rows[0].likes_count });
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}

/**
 * POST /api/ai/generate-newspaper (Admin)
 * Genera una nueva edición bajo demanda
 */
export async function triggerNewspaperGeneration(req: Request, res: Response): Promise<void> {
  try {
    const edition = await generateNewspaperEdition();
    res.json({ message: 'Edición del periódico generada con éxito.', edition });
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}

/**
 * GET /api/ai/quests/daily
 * Retorna las misiones diarias vigentes del Dungeon Master
 */
export async function getDailyQuests(req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from(TABLE_DAILY_QUESTS)
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      // Si no hay misiones para hoy, intentar generar o retornar fallback
      const quests = await generateDailyQuests();
      res.json(quests);
      return;
    }

    res.json(data);
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}

/**
 * POST /api/ai/generate-quests (Admin)
 * Fuerza la regeneración de las misiones diarias del Dungeon Master
 */
export async function triggerQuestsGeneration(req: Request, res: Response): Promise<void> {
  try {
    const quests = await generateDailyQuests();
    res.json({ message: 'Misiones diarias del Dungeon Master generadas con éxito.', quests });
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}

/**
 * POST /api/ai/trigger-pipeline (Admin)
 * Ejecuta manualmente el pipeline diario completo (Noticiero + Quests)
 */
export async function triggerFullPipeline(req: Request, res: Response): Promise<void> {
  try {
    await executeDailyAIPipeline();
    res.json({ message: 'Pipeline diario de IA ejecutado correctamente.' });
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}

/**
 * POST /api/ai/generate-boss-poll (Admin)
 * Genera una encuesta comunitaria semanal de Jefes Supremos con IA
 */
export async function triggerBossPollGeneration(req: Request, res: Response): Promise<void> {
  try {
    const result = await generateAIBossPoll();
    if (!result.success) {
      sendErrorResponse(res, new Error('No se pudo generar la encuesta de jefes por IA.'));
      return;
    }
    res.json({ message: 'Encuesta comunitaria de Jefes generada con éxito.', result });
  } catch (err: unknown) {
    sendErrorResponse(res, err);
  }
}
