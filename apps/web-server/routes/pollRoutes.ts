import express from 'express';
import * as pollController from '../controllers/pollController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createPollSchema, votePollSchema, updatePollSchema } from '../schemas/pollSchemas.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       required:
 *         - title
 *         - question
 *         - options
 *         - closes_at
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         question:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               votes:
 *                 type: integer
 *         closes_at:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /polls:
 *   get:
 *     summary: Obtener historial de encuestas
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: Lista de encuestas
 */
router.get('/', pollController.getPolls);

/**
 * @swagger
 * /polls/active:
 *   get:
 *     summary: Obtener encuesta activa actual
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: Encuesta activa
 */
router.get('/active', pollController.getActivePoll);

/**
 * @swagger
 * /polls/vote:
 *   post:
 *     summary: Votar en la encuesta activa
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               optionIndex:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Voto registrado
 */
router.post('/vote', authenticateToken, validate(votePollSchema), pollController.vote);

/**
 * @swagger
 * /polls/create:
 *   post:
 *     summary: Crear nueva encuesta (Admin)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 */
router.post('/create', authenticateToken, checkRole(ADMIN_ROLES), validate(createPollSchema), pollController.create);

/**
 * @swagger
 * /polls/update/{id}:
 *   put:
 *     summary: Actualizar encuesta (Admin)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 */
router.put('/update/:id', authenticateToken, checkRole(ADMIN_ROLES), validate(updatePollSchema), pollController.update);

/**
 * @swagger
 * /polls/close/{id}:
 *   post:
 *     summary: Cerrar encuesta manualmente (Admin)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 */
router.post('/close/:id', authenticateToken, checkRole(ADMIN_ROLES), pollController.close);

/**
 * @swagger
 * /polls/{id}:
 *   delete:
 *     summary: Eliminar encuesta (Admin)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, checkRole(ADMIN_ROLES), pollController.deletePoll);

export default router;
