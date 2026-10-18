import { Request, Response } from 'express';
import pool from '../config/database.js';
import supabase from '../config/supabaseClient.js';

export const getStatus = (_req: Request, res: Response): Response => {
  return res.json({
    success: true,
    message: 'CrystalTides Backend API is online',
    timestamp: new Date().toISOString(),
  });
};

const TIMEOUT_MS = 2000;

const withTimeout = async <T>(promise: PromiseLike<T>, ms: number = TIMEOUT_MS): Promise<T> => {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
};

export const getReadiness = async (_req: Request, res: Response): Promise<Response> => {
  let mysqlOk = false;
  let supabaseOk = false;

  try {
    await withTimeout(pool.query('SELECT 1'));
    mysqlOk = true;
  } catch (err) {
    console.error('[Health] MySQL readiness ping failed:', err);
  }

  try {
    const { error } = await withTimeout(
      supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1),
    );
    if (!error) {
      supabaseOk = true;
    } else {
      console.error('[Health] Supabase readiness ping error:', error);
    }
  } catch (err) {
    console.error('[Health] Supabase readiness ping threw:', err);
  }

  const statusCode = supabaseOk ? 200 : 503;
  let systemStatus = 'unavailable';
  if (supabaseOk) {
    systemStatus = mysqlOk ? 'ready' : 'degraded';
  }

  return res.status(statusCode).json({
    status: systemStatus,
    checks: {
      mysql: mysqlOk ? 'ok' : 'down',
      supabase: supabaseOk ? 'ok' : 'down',
    },
  });
};
