import express from 'express';
import { authenticateToken, require2FA } from '../middleware/authMiddleware.js';
import * as commandService from '../services/commandService.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { queueCommandSchema } from '../schemas/bridgeSchemas.js';

const router = express.Router();

const OWNER_ONLY_COMMANDS = new Set(['op', 'deop']);
const ALLOWED_OP_USERS = new Set(['neroferno', 'killuwu', 'killu']);

// POST /api/bridge/queue - Queue a command (Admin only + 2FA)
router.post(
  '/queue',
  authenticateToken,
  checkRole(ADMIN_ROLES),
  require2FA,
  validate(queueCommandSchema),
  async (req, res) => {
    const { command } = req.body;

    // Security: Restrict privilege commands to Owners only (neroferno, killuwu).
    // Normalization defeats bypasses: leading slashes ("/op x"), tabs ("op\tx"),
    // extra spaces and namespaced commands ("minecraft:op x").
    const baseCmd = String(command)
      .trim()
      .replace(/^\/+/, '') // strip leading slash(es)
      .replace(/\s+/g, ' ') // collapse tabs/multiple spaces
      .split(' ')[0] // first token = command name
      .toLowerCase()
      .replace(/^.*:/, ''); // strip namespace prefix (minecraft:op -> op)

    if (OWNER_ONLY_COMMANDS.has(baseCmd)) {
      const userRole = (req.user?.role || '').toLowerCase();
      const username = (req.user?.username || '').toLowerCase();

      const isAuthorizedOwner = ALLOWED_OP_USERS.has(userRole) || ALLOWED_OP_USERS.has(username);

      if (!isAuthorizedOwner) {
        return res
          .status(403)
          .json({ error: 'Permission Denied: Only Owners can use /op or /deop' });
      }
    }

    const result = await commandService.queueCommand(command);
    if (result.success) {
      res.json({ message: 'Command queued successfully', id: result.id });
    } else {
      res.status(500).json({ error: 'Failed to queue command' });
    }
  },
);

export default router;
