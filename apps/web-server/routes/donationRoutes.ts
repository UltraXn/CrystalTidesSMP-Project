import express from 'express';
import { testDonation, getDonations, createDonation, updateDonation, deleteDonation, getDonationStats } from '../controllers/donationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { createDonationSchema, updateDonationSchema } from '../schemas/donationSchemas.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Donation:
 *       type: object
 *       required:
 *         - donor_name
 *         - amount
 *         - currency
 *         - source
 *       properties:
 *         id:
 *           type: integer
 *         donor_name:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         message:
 *           type: string
 *         source:
 *           type: string
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /donations/test:
 *   post:
 *     summary: Probar trigger de donación (Admin)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/test', authenticateToken, checkRole(ADMIN_ROLES), testDonation);

/**
 * @swagger
 * /donations:
 *   get:
 *     summary: Obtener historial de donaciones (Staff)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, checkRole(STAFF_ROLES), getDonations);

/**
 * @swagger
 * /donations:
 *   post:
 *     summary: Registrar una nueva donación manualmente (Staff)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, checkRole(STAFF_ROLES), validate(createDonationSchema), createDonation);

/**
 * @swagger
 * /donations/stats:
 *   get:
 *     summary: Obtener estadísticas de donaciones (Staff)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', authenticateToken, checkRole(STAFF_ROLES), getDonationStats);

/**
 * @swagger
 * /donations/{id}:
 *   put:
 *     summary: Actualizar registro de donación (Staff)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, checkRole(STAFF_ROLES), validate(updateDonationSchema), updateDonation);

/**
 * @swagger
 * /donations/{id}:
 *   delete:
 *     summary: Eliminar registro de donación (Staff)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, checkRole(ADMIN_ROLES), deleteDonation);

export default router;
