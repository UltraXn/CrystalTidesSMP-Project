import * as ticketService from '../services/ticketService.js';
import * as logService from '../services/logService.js';
import * as minecraftService from '../services/minecraftService.js';
import { Request, Response } from 'express';

// Admin: Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// User: Create ticket
export const createTicket = async (req: Request, res: Response) => {
    try {
        const { user_id, subject, description, priority } = req.body;

        if (!user_id || !subject) {
            return res.status(400).json({ error: 'Missing user_id or subject' });
        }

        const ticket = await ticketService.createTicket(user_id, { subject, description, priority });
        
        // Log
        logService.createLog({
            user_id,
            username: 'User', // TODO: Fetch real username
            action: 'CREATE_TICKET',
            details: `Ticket #${ticket.id}: ${subject}`,
            source: 'web'
        }).catch(console.error);

        res.status(201).json(ticket);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update Status
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await ticketService.updateTicketStatus(parseInt(id), status);
        
        logService.createLog({
            username: 'Staff', // TODO: Get from auth middleware
            action: 'UPDATE_STATUS',
            details: `Ticket #${id} status changed to ${status}`,
            source: 'web'
        }).catch(console.error);

        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Stats
export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await ticketService.getTicketStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Messages
export const getMessages = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const messages = await ticketService.getTicketMessages(parseInt(id));
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Add Message
export const addMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { user_id, message, is_staff } = req.body;

        if (!message) return res.status(400).json({ error: "Message is required" });

        const newMessage = await ticketService.addTicketMessage(parseInt(id), user_id, message, is_staff);
        res.status(201).json(newMessage);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const banUser = async (req: Request, res: Response) => {
    try {
        const { username, reason } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const cmd = `ban ${username} ${reason || 'Banned via Web Panel'}`;
        const result = await minecraftService.sendCommand(cmd);

        if (result.success) {
            logService.createLog({
                username: 'Staff',
                action: 'BAN_USER',
                details: `Banned user ${username}. Reason: ${reason || 'N/A'}`,
                source: 'web'
            }).catch(console.error);

            res.json({ message: `User ${username} banned successfully` });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ticketService.deleteTicket(parseInt(id));

        logService.createLog({
            username: 'Staff',
            action: 'DELETE_TICKET',
            details: `Deleted ticket #${id}`,
            source: 'web'
        }).catch(console.error);

        res.json({ message: "Ticket deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
