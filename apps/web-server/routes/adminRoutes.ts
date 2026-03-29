import express from 'express';
import multer from 'multer';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// Configure Multer for Memory Storage (Buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
    fileFilter: (req, file, cb) => {
        // Only allow .jar files for mods (MIME type check)
        const allowedMimeTypes = ['application/java-archive', 'application/x-java-archive', 'application/octet-stream'];
        const isJar = file.originalname.toLowerCase().endsWith('.jar');
        
        if (allowedMimeTypes.includes(file.mimetype) || isJar) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .jar files are allowed.'));
        }
    }
});

// POST /api/admin/upload-mod
router.post('/upload-mod', authenticateToken, checkRole(ADMIN_ROLES), upload.single('file'), adminController.uploadMod);

export default router;
