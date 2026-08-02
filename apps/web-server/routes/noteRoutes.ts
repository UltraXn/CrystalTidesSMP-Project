import express from 'express';
import * as noteController from '../controllers/noteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { createNoteSchema } from '../schemas/noteSchemas.js';

const router = express.Router();

// All staff note routes require authentication and staff role
router.use(authenticateToken);
router.use(checkRole(STAFF_ROLES));

// GET /api/staff/notes
router.get('/', noteController.getNotes);

// POST /api/staff/notes
router.post('/', validate(createNoteSchema), noteController.createNote);

// DELETE /api/staff/notes/:id
router.delete('/:id', noteController.deleteNote);

export default router;
