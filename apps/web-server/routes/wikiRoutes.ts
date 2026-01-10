import express from 'express';
import * as wikiController from '../controllers/wikiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createWikiArticleSchema, updateWikiArticleSchema } from '../schemas/wikiSchemas.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WikiArticle:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - category
 *         - slug
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         title_en:
 *           type: string
 *         content:
 *           type: string
 *         content_en:
 *           type: string
 *         description:
 *           type: string
 *         description_en:
 *           type: string
 *         category:
 *           type: string
 *         slug:
 *           type: string
 *         icon:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /wiki:
 *   get:
 *     summary: Obtener todos los artículos de la wiki
 *     tags: [Wiki]
 *     responses:
 *       200:
 *         description: Lista de artículos
 */
router.get('/', wikiController.getArticles);

/**
 * @swagger
 * /wiki/{slug}:
 *   get:
 *     summary: Obtener un artículo por slug
 *     tags: [Wiki]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artículo encontrado
 */
router.get('/:slug', wikiController.getArticle);

/**
 * @swagger
 * /wiki:
 *   post:
 *     summary: Crear un nuevo artículo (Staff)
 *     tags: [Wiki]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, checkRole(ADMIN_ROLES), validate(createWikiArticleSchema), wikiController.createWikiArticle);

/**
 * @swagger
 * /wiki/{id}:
 *   put:
 *     summary: Actualizar un artículo (Staff)
 *     tags: [Wiki]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, checkRole(ADMIN_ROLES), validate(updateWikiArticleSchema), wikiController.updateWikiArticle);

/**
 * @swagger
 * /wiki/{id}:
 *   delete:
 *     summary: Eliminar un artículo (Staff)
 *     tags: [Wiki]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, checkRole(ADMIN_ROLES), wikiController.deleteWikiArticle);

export default router;
