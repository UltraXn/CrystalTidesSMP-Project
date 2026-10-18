import * as logService from '../services/logService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';
import { getClientIp } from '../utils/clientIp.js';

const handleLogError = (res: Response, error: unknown) => {
  console.error('[LogController] Internal error:', error);
  res.status(500).json({ error: 'Internal server error' });
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const page = ensureString(req.query.page, '1');
    const limit = ensureString(req.query.limit, '50');
    const source = ensureString(req.query.source, 'web');
    const search = ensureString(req.query.search, '');
    const parsedPage = Number.parseInt(page, 10) || 1;
    const parsedLimit = Number.parseInt(limit, 10) || 50;
    const offset = (parsedPage - 1) * parsedLimit;

    if (source === 'game') {
      const data = await logService.getGameLogs({ limit: parsedLimit, offset, search });
      return res.json(data);
    }

    const data = await logService.getLogs({ limit: parsedLimit, offset, source, search });
    res.json(data);
  } catch (error) {
    handleLogError(res, error);
  }
};

export const createLog = async (req: Request, res: Response) => {
  try {
    const logData = req.body;
    const log = await logService.createLog(logData);
    res.status(201).json(log);
  } catch (error) {
    handleLogError(res, error);
  }
};

export const reportSecurityAlert = async (req: Request, res: Response) => {
  try {
    const { email, details } = req.body;
    const ip = getClientIp(req);

    // Create a SECURITY log
    await logService.createLog({
      username: 'SYSTEM_ALERT',
      action: 'LOGIN_FAIL',
      details: `Failed login attempt for: ${email}. IP: ${ip}. ${details || ''}`,
      source: 'security',
    });

    // Always return success to not leak info to attacker
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Security Report Error:', error);
    res.status(200).json({ success: true }); // Silent fail
  }
};
