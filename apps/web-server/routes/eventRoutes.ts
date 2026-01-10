import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createEventSchema, updateEventSchema, registerEventSchema } from '../schemas/eventSchemas.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - start_date
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         image_url:
 *           type: string
 *         max_participants:
 *           type: integer
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Obtener todos los eventos programados
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
router.get('/', eventController.getAllEvents);

/**
 * @swagger
 * /events/my-registrations:
 *   get:
 *     summary: Obtener registros del usuario actual
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-registrations', authenticateToken, eventController.getUserRegistrations);

/**
 * @swagger
 * /events/{id}/registrations:
 *   get:
 *     summary: Obtener lista de registros para un evento (Staff)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/registrations', authenticateToken, checkRole(STAFF_ROLES), eventController.getEventRegistrations);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crear un nuevo evento (Admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, checkRole(ADMIN_ROLES), validate(createEventSchema), eventController.createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Actualizar un evento (Admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, checkRole(ADMIN_ROLES), validate(updateEventSchema), eventController.updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Eliminar un evento (Admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, checkRole(ADMIN_ROLES), eventController.deleteEvent);

/**
 * @swagger
 * /events/{id}/register:
 *   post:
 *     summary: Registrarse para un evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/register', authenticateToken, validate(registerEventSchema), eventController.registerForEvent);

export default router;
