import express from 'express';
import * as logsController from '../controllers/logsController.js'; // CoreProtect Logs
import * as logController from '../controllers/logController.js'; // Internal Logs
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createLogSchema, reportSecuritySchema } from '../schemas/logSchemas.js';

const router = express.Router();

// All log routes require staff authentication
router.use(authenticateToken);
router.use(checkRole(STAFF_ROLES));

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Auditoría y registros del sistema y juego
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Obtener logs del panel web (DB)
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad por página
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [web, game]
 *         description: Fuente del log
 *     responses:
 *       200:
 *         description: Lista de logs recuperada exitosamente
 */
router.get('/', logController.getLogs);
router.post('/', validate(createLogSchema), logController.createLog);

/**
 * @swagger
 * /logs/commands:
 *   get:
 *     summary: Obtener logs de comandos del juego (CoreProtect)
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Lista de comandos ejecutados por jugadores
 */
router.get('/commands', logsController.getCommandLogs);

// Security Reporting (Public/Semi-public)
import { optionalAuthenticateToken } from '../middleware/authMiddleware.js';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';

router.post('/security/report', sensitiveActionLimiter, optionalAuthenticateToken, validate(reportSecuritySchema), logController.reportSecurityAlert);

export default router;
