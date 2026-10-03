import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken, optionalAuthenticateToken, require2FA } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { 
    updateUserMetadataSchema, 
    updateUserRoleSchema,
    voteKarmaSchema,
    profileSchema
} from '../schemas/userSchemas.js';
import { checkRole, ADMIN_ROLES, STAFF_ROLES } from '../utils/roleUtils.js';

const ROUTES = {
    ROOT: '/',
    STAFF: '/staff',
    PROFILE: '/profile/:username',
    PROFILE_FULL: '/profile/:username/full',
    ROLE: '/:id/role',
    METADATA: '/:id/metadata',
    KARMA: '/:id/karma',
} as const;

const router = express.Router();

const validateProfile = validate(profileSchema);
const requireAdminWith2FA = [
    authenticateToken, 
    checkRole(ADMIN_ROLES), 
    require2FA
] as const;

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
router.get(ROUTES.ROOT, authenticateToken, checkRole(ADMIN_ROLES), userController.getAllUsers);

router.get(ROUTES.STAFF, authenticateToken, checkRole(STAFF_ROLES), userController.getStaffUsers);

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
router.get(ROUTES.PROFILE, validateProfile, userController.getPublicProfile);

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
// optionalAuthenticateToken: wallet data is only exposed to the owner or staff
router.get(ROUTES.PROFILE_FULL, optionalAuthenticateToken, validateProfile, userController.getFullProfile);

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
router.patch(ROUTES.ROLE, ...requireAdminWith2FA, validate(updateUserRoleSchema), userController.updateUserRole);

router.patch(ROUTES.METADATA, ...requireAdminWith2FA, validate(updateUserMetadataSchema), userController.updateUserMetadata);

router.post(ROUTES.KARMA, authenticateToken, validate(voteKarmaSchema), userController.giveKarma);

export default router;