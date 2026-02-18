import express from 'express';
import multer from 'multer';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken, require2FA } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// Configure Multer for Memory Storage (Buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

// POST /api/admin/upload-mod
router.post('/upload-mod', authenticateToken, checkRole(ADMIN_ROLES), require2FA, upload.single('file'), adminController.uploadMod);

export default router;
