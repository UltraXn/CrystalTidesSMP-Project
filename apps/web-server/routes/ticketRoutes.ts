import express from 'express';
import * as ticketController from '../controllers/ticketController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createTicketSchema, addTicketMessageSchema, updateTicketStatusSchema, banUserSchema } from '../schemas/ticketSchemas.js';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// All ticket routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - subject
 *         - description
 *         - priority
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: string
 *         subject:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [open, pending, resolved, closed]
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Obtener todos los tickets (Staff)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', checkRole(STAFF_ROLES), ticketController.getAllTickets);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Crear un nuevo ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', sensitiveActionLimiter, validate(createTicketSchema), ticketController.createTicket);

/**
 * @swagger
 * /tickets/stats:
 *   get:
 *     summary: Obtener estadísticas de tickets (Staff)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', checkRole(STAFF_ROLES), ticketController.getStats);

/**
 * @swagger
 * /tickets/{id}/status:
 *   patch:
 *     summary: Actualizar estado de un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', validate(updateTicketStatusSchema), ticketController.updateStatus);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Eliminar un ticket (Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', checkRole(ADMIN_ROLES), ticketController.deleteTicket);

/**
 * @swagger
 * /tickets/{id}/messages:
 *   get:
 *     summary: Obtener mensajes de un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/messages', ticketController.getMessages);

/**
 * @swagger
 * /tickets/{id}/messages:
 *   post:
 *     summary: Añadir mensaje a un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/messages', sensitiveActionLimiter, validate(addTicketMessageSchema), ticketController.addMessage);

/**
 * @swagger
 * /tickets/ban:
 *   post:
 *     summary: Banear usuario del sistema de tickets (Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post('/ban', checkRole(ADMIN_ROLES), validate(banUserSchema), ticketController.banUser);

export default router;
