import express from 'express';
import * as newsController from '../controllers/newsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Noticias
 *   description: Gestión de noticias y anuncios
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Obtener todas las noticias
 *     tags: [Noticias]
 *     responses:
 *       200:
 *         description: Lista de noticias
 *   post:
 *     summary: Crear una nueva noticia (Admin)
 *     tags: [Noticias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Noticia creada
 */
import { validate } from '../middleware/validateResource.js';
import { createNewsSchema, updateNewsSchema, createCommentSchema, updateCommentSchema } from '../schemas/newsSchemas.js';

router.get('/', newsController.getAllNews);
router.post('/', authenticateToken, checkRole(ADMIN_ROLES), validate(createNewsSchema), newsController.createNews);

router.get('/:id', newsController.getNewsById);
router.get('/:id/comments', newsController.getCommentsByNewsId);
router.post('/:id/comments', authenticateToken, validate(createCommentSchema), newsController.createComment);
router.put('/comments/:id', authenticateToken, validate(updateCommentSchema), newsController.updateComment);
router.delete('/comments/:id', authenticateToken, newsController.deleteComment);

router.put('/:id', authenticateToken, checkRole(ADMIN_ROLES), validate(updateNewsSchema), newsController.updateNews);
router.delete('/:id', authenticateToken, checkRole(ADMIN_ROLES), newsController.deleteNews);

export default router;
