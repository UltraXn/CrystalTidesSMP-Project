import express from 'express';
import * as gachaController from '../controllers/gachaController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { rollGachaSchema } from '../schemas/gachaSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Gacha
 *   description: Sistema de recompensas diarias
 */

/**
 * @swagger
 * /gacha/roll:
 *   post:
 *     summary: Tirar de la ruleta (1 vez cada 24h)
 *     tags: [Gacha]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Éxito
 *       429:
 *         description: Cooldown activo
 */
router.post('/roll', authenticateToken, validate(rollGachaSchema), gachaController.roll);

/**
 * @swagger
 * /gacha/history/{userId}:
 *   get:
 *     summary: Obtener historial de premios
 *     tags: [Gacha]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial recuperado
 */
router.get('/history/:userId', authenticateToken, gachaController.getHistory);

export default router;
