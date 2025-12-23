import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Routes (Should be protected with Admin Middleware in production)
router.get('/', userController.getAllUsers);
router.get('/profile/:username', userController.getPublicProfile);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/metadata', userController.updateUserMetadata);

export default router;
