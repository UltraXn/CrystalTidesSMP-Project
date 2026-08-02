import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { imageUploadLimiter } from '../middleware/rateLimitMiddleware.js';
import { uploadImage, UploadValidationError, BUCKET_RULES } from '../services/imageUploadService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { validate } from '../middleware/validateResource.js';
import { uploadImageSchema } from '../schemas/uploadSchemas.js';

const router = express.Router();

// Hard cap at multer level slightly above the largest bucket limit;
// the real per-bucket limit is enforced in the service.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 6 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        // First line of defense: client must at least CLAIM it's an image.
        // The real check is magic-byte detection in the service.
        if (/^image\/(png|jpe?g|gif|webp|avif)$/.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only image files are allowed.'));
        }
    }
});

/**
 * POST /api/uploads/image
 * multipart fields:
 *   - file:   the image blob (required)
 *   - bucket: one of BUCKET_RULES keys (required)
 *   - folder: optional safe subfolder (sanitized server-side)
 *
 * Identity always comes from the verified token — never from the body.
 */
router.post('/image', authenticateToken, imageUploadLimiter, upload.single('file'), validate(uploadImageSchema), async (req, res) => {
    try {
        if (!req.user) return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401);
        if (!req.file) return sendError(res, 'No file uploaded', 'MISSING_FILE', 400);

        const bucket = String(req.body.bucket || '');
        const folder = req.body.folder ? String(req.body.folder) : undefined;

        const result = await uploadImage({
            buffer: req.file.buffer,
            bucket,
            userId: req.user.id,
            userRole: req.user.role || 'user',
            folder,
        });

        return sendSuccess(res, result, 'Image uploaded');
    } catch (error) {
        if (error instanceof UploadValidationError) {
            return sendError(res, error.message, 'INVALID_UPLOAD', error.statusCode);
        }
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
});

export default router;
export { BUCKET_RULES };
