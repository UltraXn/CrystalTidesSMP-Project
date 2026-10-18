import { Router } from 'express';
import * as ticketController from '../controllers/ticketController.js';
import { authenticateToken, require2FA } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import {
  createTicketSchema,
  addTicketMessageSchema,
  updateTicketStatusSchema,
  banUserSchema,
} from '@crystaltides/shared';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';

const TICKET_ROUTES = {
  ROOT: '/',
  STATS: '/stats',
  BY_ID: '/:id',
  STATUS: '/:id/status',
  MESSAGES: '/:id/messages',
  BAN: '/ban',
} as const;

// Deduplicated Role Middlewares
const requireStaff = checkRole(STAFF_ROLES);
const requireAdmin = checkRole(ADMIN_ROLES);

// Deduplicated Validation Middlewares
const validateCreateTicket = validate(createTicketSchema);
const validateUpdateStatus = validate(updateTicketStatusSchema);
const validateAddMessage = validate(addTicketMessageSchema);
const validateBanUser = validate(banUserSchema);

const router = Router();

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
router.get(TICKET_ROUTES.ROOT, requireStaff, ticketController.getAllTickets);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Crear un nuevo ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  TICKET_ROUTES.ROOT,
  sensitiveActionLimiter,
  validateCreateTicket,
  ticketController.createTicket,
);

/**
 * @swagger
 * /tickets/stats:
 *   get:
 *     summary: Obtener estadísticas de tickets (Staff)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.get(TICKET_ROUTES.STATS, requireStaff, ticketController.getStats);

/**
 * @swagger
 * /tickets/{id}/status:
 *   patch:
 *     summary: Actualizar estado de un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.patch(TICKET_ROUTES.STATUS, validateUpdateStatus, ticketController.updateStatus);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Eliminar un ticket (Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.delete(TICKET_ROUTES.BY_ID, requireAdmin, ticketController.deleteTicket);

/**
 * @swagger
 * /tickets/{id}/messages:
 *   get:
 *     summary: Obtener mensajes de un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.get(TICKET_ROUTES.MESSAGES, ticketController.getMessages);

/**
 * @swagger
 * /tickets/{id}/messages:
 *   post:
 *     summary: Añadir mensaje a un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  TICKET_ROUTES.MESSAGES,
  sensitiveActionLimiter,
  validateAddMessage,
  ticketController.addMessage,
);

/**
 * @swagger
 * /tickets/ban:
 *   post:
 *     summary: Banear usuario del sistema de tickets (Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post('/ban', requireAdmin, require2FA, validateBanUser, ticketController.banUser);

export default router;
