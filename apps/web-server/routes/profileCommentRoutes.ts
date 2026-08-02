import express from 'express';
import * as commentController from '../controllers/profileCommentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { postCommentSchema, getCommentsSchema, deleteCommentSchema } from '../schemas/profileCommentSchemas.js';

const router = express.Router();

// Public: Get comments for a profile
router.get('/:profileId', validate(getCommentsSchema), commentController.getComments);

// Protected: Post a comment
router.post('/:profileId', authenticateToken, validate(postCommentSchema), commentController.postComment);

// Protected: Delete a comment (RLS handles ownership)
router.delete('/:id', authenticateToken, validate(deleteCommentSchema), commentController.removeComment);

export default router;
