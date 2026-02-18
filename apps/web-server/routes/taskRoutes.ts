import express from 'express';
import * as taskController from '../controllers/taskController.js';
import * as calendarController from '../controllers/calendarController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// All staff task routes require authentication and staff role
router.use(authenticateToken);
router.use(checkRole(STAFF_ROLES));

// --- Calendar & External Integrations (Specific paths first) ---

// Subscribe Link (GET /api/staff/tasks/calendar/subscribe)
router.get('/calendar/subscribe', calendarController.getCalendarSubscribeLink);

// GET /api/staff/tasks/calendar
router.get('/calendar', calendarController.getCalendarEvents);

// POST /api/staff/tasks/calendar/sync
router.post('/calendar/sync', calendarController.syncTaskToCalendar);

// --- Standard CRUD (Generic paths last) ---

// GET /api/staff/tasks
router.get('/', taskController.getTasks);

// POST /api/staff/tasks
router.post('/', taskController.createTask);

// PUT /api/staff/tasks/:id
router.put('/:id', taskController.updateTask);

// DELETE /api/staff/tasks/:id
router.delete('/:id', taskController.deleteTask);

export default router;
