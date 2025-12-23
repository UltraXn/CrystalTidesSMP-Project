import express from 'express';
import * as newsController from '../controllers/newsController.js';

const router = express.Router();

// Define routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.get('/:id/comments', newsController.getCommentsByNewsId);
router.post('/:id/comments', newsController.createComment);
router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

export default router;
