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

export const getReadiness = async (_req: Request, res: Response): Promise<Response> => {
  let mysqlOk = false;
  let supabaseOk = false;

  try {
    await pool.query('SELECT 1');
    mysqlOk = true;
  } catch (err) {
    console.error('[Health] MySQL readiness ping failed:', err);
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    if (!error) {
      supabaseOk = true;
    } else {
      console.error('[Health] Supabase readiness ping error:', error);
    }
  } catch (err) {
    console.error('[Health] Supabase readiness ping threw:', err);
  }

  const isHealthy = mysqlOk && supabaseOk;
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: isHealthy ? 'ready' : 'unavailable',
    checks: {
      mysql: mysqlOk ? 'ok' : 'down',
      supabase: supabaseOk ? 'ok' : 'down',
    },
  });
};
