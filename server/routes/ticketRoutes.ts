import express from 'express';
import * as ticketController from '../controllers/ticketController.js';

const router = express.Router();

// Ticket Routes
router.get('/', ticketController.getAllTickets);
router.post('/', ticketController.createTicket);
router.get('/stats', ticketController.getStats);

// Ticket Operations
router.patch('/:id/status', ticketController.updateStatus);
router.delete('/:id', ticketController.deleteTicket);

// Messages
router.get('/:id/messages', ticketController.getMessages);
router.post('/:id/messages', ticketController.addMessage);

// Ban User (Admin Action)
router.post('/ban', ticketController.banUser);

export default router;
