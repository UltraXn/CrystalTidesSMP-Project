import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios web
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', authenticateToken, checkRole(ADMIN_ROLES), userController.getAllUsers);
router.get('/staff', userController.getStaffUsers);

/**
 * @swagger
 * /users/profile/{username}:
 *   get:
 *     summary: Obtener perfil público de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del perfil público (skin, medallas, stats)
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile/:username', userController.getPublicProfile);

/**
 * @swagger
 * /users/profile/{username}/full:
 *   get:
 *     summary: Obtener perfil completo (Stats + Eco + Foro)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil completo unificado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile/:username/full', userController.getFullProfile);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Actualizar rol de usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, developer, moderator]
 *     responses:
 *       200:
 *         description: Rol actualizado
 */
import { validate } from '../middleware/validateResource.js';
import { 
    updateUserMetadataSchema, 
    updateUserRoleSchema 
} from '../schemas/userSchemas.js';

router.patch('/:id/role', authenticateToken, checkRole(ADMIN_ROLES), validate(updateUserRoleSchema), userController.updateUserRole);
router.patch('/:id/metadata', authenticateToken, checkRole(ADMIN_ROLES), validate(updateUserMetadataSchema), userController.updateUserMetadata);
router.post('/:id/karma', authenticateToken, userController.giveKarma);

export default router;
