import express from 'express';
import * as eventController from '../controllers/eventController.js';

const router = express.Router();

router.get('/my-registrations', eventController.getUserRegistrations);
router.get('/:id/registrations', eventController.getEventRegistrations);
router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent); // Should add auth middleware eventually
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/register', eventController.registerForEvent);

export default router;
