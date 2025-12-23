import express from 'express';
import * as forumController from '../controllers/forumController.js';

const router = express.Router();

router.get('/stats', forumController.getStats);
router.get('/category/:categoryId', forumController.getThreads);
router.get('/user/:userId/threads', forumController.getUserThreads);
router.get('/thread/:id', forumController.getThread);
router.post('/threads', forumController.createThread);
router.get('/thread/:id/posts', forumController.getPosts);
router.post('/thread/:id/posts', forumController.createPost);
router.put('/thread/:id', forumController.updateThread);
router.delete('/thread/:id', forumController.deleteThread);
router.put('/posts/:id', forumController.updatePost);
router.delete('/posts/:id', forumController.deletePost);

export default router;
