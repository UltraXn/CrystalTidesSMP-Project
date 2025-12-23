import express from 'express';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// GET /api/staff/tasks
router.get('/', taskController.getTasks);

// POST /api/staff/tasks
router.post('/', taskController.createTask);

// PUT /api/staff/tasks/:id
router.put('/:id', taskController.updateTask);

// DELETE /api/staff/tasks/:id
router.delete('/:id', taskController.deleteTask);

export default router;
