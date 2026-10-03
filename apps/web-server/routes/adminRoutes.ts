import express, { type Router } from 'express';
import multer from 'multer';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const ADMIN_ROUTES = {
  UPLOAD_MOD: '/upload-mod',
} as const;

const UPLOAD_CONFIG = {
  FIELD_NAME: 'file',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // NOSONAR: 50MB required for larger Minecraft server mod jars
  MAX_FILES: 1,
  JAR_EXTENSION: '.jar',
} as const;

const ALLOWED_JAR_MIME_TYPES = new Set<string>([
  'application/java-archive',
  'application/x-java-archive',
  'application/octet-stream',
]);

const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Invalid file type. Only .jar files are allowed.',
} as const;

const requireAdminAuth = [authenticateToken, checkRole(ADMIN_ROLES)] as const;

function isJarFile(file: Express.Multer.File): boolean {
  const hasJarExtension = file.originalname.toLowerCase().endsWith(UPLOAD_CONFIG.JAR_EXTENSION);
  const hasAllowedMimeType = ALLOWED_JAR_MIME_TYPES.has(file.mimetype);
  return hasJarExtension && hasAllowedMimeType;
}

const jarFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (isJarFile(file)) {
    cb(null, true);
    return;
  }
  cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: UPLOAD_CONFIG.MAX_FILES,
  },
  fileFilter: jarFileFilter,
});

const router: Router = express.Router();

// POST /api/admin/upload-mod
router.post(
  ADMIN_ROUTES.UPLOAD_MOD,
  ...requireAdminAuth,
  upload.single(UPLOAD_CONFIG.FIELD_NAME),
  adminController.uploadMod,
);

export default router;