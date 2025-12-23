import express from 'express';
import * as noteController from '../controllers/noteController.js';

const router = express.Router();

// GET /api/staff/notes
router.get('/', noteController.getNotes);

// POST /api/staff/notes
router.post('/', noteController.createNote);

// DELETE /api/staff/notes/:id
router.delete('/:id', noteController.deleteNote);

export default router;
