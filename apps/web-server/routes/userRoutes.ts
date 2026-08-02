import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken, optionalAuthenticateToken, require2FA } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';

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
router.get('/staff', authenticateToken, checkRole(STAFF_ROLES), userController.getStaffUsers);

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
    updateUserRoleSchema,
    voteKarmaSchema,
    profileSchema
} from '../schemas/userSchemas.js';

router.get('/profile/:username', validate(profileSchema), userController.getPublicProfile);
// optionalAuthenticateToken: wallet data is only exposed to the owner or staff
router.get('/profile/:username/full', optionalAuthenticateToken, validate(profileSchema), userController.getFullProfile);

router.patch('/:id/role', authenticateToken, checkRole(ADMIN_ROLES), require2FA, validate(updateUserRoleSchema), userController.updateUserRole);
router.patch('/:id/metadata', authenticateToken, checkRole(ADMIN_ROLES), require2FA, validate(updateUserMetadataSchema), userController.updateUserMetadata);
router.post('/:id/karma', authenticateToken, validate(voteKarmaSchema), userController.giveKarma);

export default router;
