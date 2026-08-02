import express from 'express';
import * as playerStatsController from '../controllers/playerStatsController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stats & Rankings
 *   description: Estadísticas de juego y rankings globales
 */

/**
 * @swagger
 * /player-stats/{username}:
 *   get:
 *     summary: Obtener estadísticas completas de un jugador (Minecraft + Web)
 *     tags: [Stats & Rankings]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario o UUID
 *     responses:
 *       200:
 *         description: Stats recuperadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     playtime:
 *                       type: string
 *                       example: "12h 30m"
 *                     kills:
 *                       type: number
 *                     money:
 *                       type: string
 *       404:
 *         description: Jugador no encontrado
 */
router.get('/:username', playerStatsController.getPlayerStats);

export default router;
