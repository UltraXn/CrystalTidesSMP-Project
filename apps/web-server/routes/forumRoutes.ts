import express from 'express';
import * as forumController from '../controllers/forumController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { createThreadSchema, createPostSchema, updateThreadSchema, updatePostSchema } from '../schemas/forumSchemas.js';

const router = express.Router();

router.get('/stats', forumController.getStats);
router.get('/category/:categoryId', forumController.getThreads);
router.get('/user/:userId/threads', forumController.getUserThreads);
router.get('/thread/:id', forumController.getThread);
router.get('/thread/:id/full', forumController.getThreadFull); // Aggregated
router.get('/thread/:id/posts', forumController.getPosts);

// Authenticated routes
router.use(authenticateToken);

router.post('/threads', validate(createThreadSchema), forumController.createThread);
router.post('/thread/:id/posts', validate(createPostSchema), forumController.createPost);
router.put('/thread/:id', validate(updateThreadSchema), forumController.updateThread);
router.delete('/thread/:id', forumController.deleteThread);
router.put('/posts/:id', validate(updatePostSchema), forumController.updatePost);
router.delete('/posts/:id', forumController.deletePost);

export default router;
