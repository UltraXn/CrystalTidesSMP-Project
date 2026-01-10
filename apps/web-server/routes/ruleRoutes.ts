import express from 'express';
import * as ruleController from '../controllers/ruleController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rules
 *   description: Normativas del servidor (Interactive Rules)
 */

/**
 * @swagger
 * /rules:
 *   get:
 *     summary: Obtener todas las reglas
 *     tags: [Rules]
 *     responses:
 *       200:
 *         description: Lista de reglas ordenadas
 */
import { validate } from '../middleware/validateResource.js';
import { ruleSchema, updateRuleSchema } from '../schemas/ruleSchemas.js';

router.get('/', ruleController.getRules);

// Protected Routes (Admin/Staff only)
router.post('/', authenticateToken, checkRole(STAFF_ROLES), validate(ruleSchema), ruleController.createRule);
router.put('/:id', authenticateToken, checkRole(STAFF_ROLES), validate(updateRuleSchema), ruleController.updateRule);
router.delete('/:id', authenticateToken, checkRole(STAFF_ROLES), ruleController.deleteRule);

export default router;
