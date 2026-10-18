import express, { type Request } from 'express';
import { authenticateToken, require2FA } from '../middleware/authMiddleware.js';
import * as commandService from '../services/commandService.js';
import * as logService from '../services/logService.js';
import { checkRole, ADMIN_ROLES, SERVICE_ROLE } from '../utils/roleUtils.js';
import { authorizeCommand } from '../utils/commandPolicy.js';
import { adminCommandLimiter } from '../middleware/rateLimitMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { queueCommandSchema } from '../schemas/bridgeSchemas.js';

const router = express.Router();

const AUDIT_ACTIONS = {
  QUEUED: 'BRIDGE_COMMAND_QUEUED',
  REJECTED: 'BRIDGE_COMMAND_REJECTED',
} as const;

// Every human-issued console command and every refused attempt is kept in
// system_logs. Chat relayed by the bot is not: Discord already keeps it.
const auditCommand = (req: Request, action: string, details: Record<string, string>) => {
  const user = req.user;
  const isService = user?.role === SERVICE_ROLE;
  logService
    .createLog({
      user_id: isService ? undefined : user?.id,
      username: user?.username ?? user?.email ?? 'Unknown',
      action,
      details: { ...details, role: user?.role ?? 'unknown' },
      source: action === AUDIT_ACTIONS.REJECTED ? 'security' : 'web',
    })
    .catch(console.error);
};

// POST /api/bridge/queue - Queue a console command (admins + 2FA, or the bot's chat relay)
router.post(
  '/queue',
  authenticateToken,
  adminCommandLimiter,
  checkRole([...ADMIN_ROLES, SERVICE_ROLE]),
  require2FA,
  validate(queueCommandSchema),
  async (req, res) => {
    const role = (req.user?.role ?? '').toLowerCase();
    const decision = authorizeCommand(role, String(req.body.command));

    if (!decision.allowed) {
      auditCommand(req, AUDIT_ACTIONS.REJECTED, {
        command: String(req.body.command),
        reason: decision.reason,
      });
      return res.status(403).json({ error: `Permission Denied: ${decision.reason}` });
    }

    const result = await commandService.queueCommand(decision.command);
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to queue command' });
    }

    if (role !== SERVICE_ROLE) {
      auditCommand(req, AUDIT_ACTIONS.QUEUED, {
        command: decision.command,
        queue_id: String(result.id),
      });
    }
    res.json({ message: 'Command queued successfully', id: result.id });
  },
);

export default router;
