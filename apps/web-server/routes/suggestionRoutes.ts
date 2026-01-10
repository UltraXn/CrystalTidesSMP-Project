import express from 'express';
import * as suggestionController from '../controllers/suggestionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createSuggestionSchema, updateSuggestionStatusSchema } from '../schemas/suggestionSchemas.js';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Suggestion:
 *       type: object
 *       required:
 *         - type
 *         - nickname
 *         - message
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *         nickname:
 *           type: string
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, implemented]
 *         votes:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /suggestions:
 *   get:
 *     summary: Obtener todas las sugerencias (Público)
 *     tags: [Suggestions]
 *     responses:
 *       200:
 *         description: Lista de sugerencias
 */
router.get('/', suggestionController.getSuggestions);

/**
 * @swagger
 * /suggestions:
 *   post:
 *     summary: Crear una nueva sugerencia
 *     tags: [Suggestions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Suggestion'
 */
router.post('/', sensitiveActionLimiter, validate(createSuggestionSchema), suggestionController.createSuggestion);

/**
 * @swagger
 * /suggestions/{id}/status:
 *   patch:
 *     summary: Actualizar estado de una sugerencia (Staff)
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authenticateToken, checkRole(STAFF_ROLES), validate(updateSuggestionStatusSchema), suggestionController.updateStatus);

/**
 * @swagger
 * /suggestions/{id}:
 *   delete:
 *     summary: Eliminar una sugerencia (Staff)
 *     tags: [Suggestions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, checkRole(STAFF_ROLES), suggestionController.deleteSuggestion);

export default router;
