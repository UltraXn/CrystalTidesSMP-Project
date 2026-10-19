import express from 'express';
import { submitCrashReport } from '../controllers/crashReportController.js';
import { validate } from '../middleware/validateResource.js';
import { createCrashReportSchema } from '@crystaltides/shared';
import { crashReportLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /launcher/crash-report:
 *   post:
 *     summary: Ingesta de reporte de crash sanitizado desde el launcher
 *     tags: [Launcher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - crashType
 *               - title
 *             properties:
 *               crashType:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reporte recibido y procesado
 *       400:
 *         description: Payload inválido
 */
router.post(
  '/crash-report',
  crashReportLimiter,
  validate(createCrashReportSchema),
  submitCrashReport,
);

export default router;
