import * as ticketService from '../services/ticketService.js';
import * as logService from '../services/logService.js';
import * as commandService from '../services/commandService.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';
import { STAFF_ROLES } from '../utils/roleUtils.js';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username?: string;
        role: string;
        email?: string;
        minecraft_uuid?: string;
    };
}

const getLogUsername = (req: Request) => {
    const user = (req as AuthenticatedRequest).user;
    return user?.username || user?.email || 'Unknown';
};

// Admin: Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await ticketService.getAllTickets();
        return sendSuccess(res, tickets);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// User: Create ticket
export const createTicket = async (req: Request, res: Response) => {
    try {
        const { subject, description, priority } = req.body;
        const user = (req as AuthenticatedRequest).user!;

        if (!subject) {
            return sendError(res, 'Missing subject', 'MISSING_FIELD', 400);
        }

        const ticket = await ticketService.createTicket(user.id, { subject, description, priority });
        
        // Log
        logService.createLog({
            username: getLogUsername(req),
            action: 'CREATE_TICKET',
            details: `Ticket #${ticket.id}: ${subject}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, ticket, 'Ticket created successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Admin/User: Update Status
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        const { status } = req.body;
        const ticketId = parseInt(id);
        const user = (req as AuthenticatedRequest).user!;

        // 1. Fetch ticket to check ownership
        const ticketInfo = await ticketService.getTicketById(ticketId);
        if (!ticketInfo) return sendError(res, 'Ticket not found', 'NOT_FOUND', 404);

        // 2. Permission check: Owner can close, Staff can do anything
        const isOwner = ticketInfo.user_id === user.id;
        const isStaff = STAFF_ROLES.includes(user.role);

        if (!isOwner && !isStaff) {
            return res.status(403).json({ error: 'You do not have permission to update this ticket' });
        }

        const ticket = await ticketService.updateTicketStatus(ticketId, status);
        
        const username = getLogUsername(req);
        
        logService.createLog({
            username: username,
            action: 'UPDATE_STATUS',
            details: `Ticket #${id} status changed to ${status}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, ticket, 'Ticket status updated');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Get Stats
export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await ticketService.getTicketStats();
        return sendSuccess(res, stats);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Get Messages
export const getMessages = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        const ticketId = parseInt(id);
        const user = (req as AuthenticatedRequest).user!;

        // 1. Fetch ticket to check ownership
        const ticket = await ticketService.getTicketById(ticketId);
        if (!ticket) return sendError(res, 'Ticket not found', 'NOT_FOUND', 404);

        // 2. Check Permissions: User must own the ticket OR be staff
        const isOwner = ticket.user_id === user.id;
        const hasStaffRole = STAFF_ROLES.includes(user.role);

        if (!isOwner && !hasStaffRole) {
            return res.status(403).json({ error: 'You do not have permission to view this ticket' });
        }

        const messages = await ticketService.getTicketMessages(ticketId);
        return sendSuccess(res, messages);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

// Add Message
export const addMessage = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        const { message } = req.body; // Remove user_id and is_staff from body for security
        const ticketId = parseInt(id);
        const user = (req as AuthenticatedRequest).user!;

        if (!message) return sendError(res, "Message is required", 'MISSING_FIELD', 400);

        // 1. Fetch ticket to check ownership
        const ticket = await ticketService.getTicketById(ticketId);
        if (!ticket) return sendError(res, 'Ticket not found', 'NOT_FOUND', 404);

        // 2. Permission check: Only owner or staff can reply
        const isOwner = ticket.user_id === user.id;
        const isStaff = STAFF_ROLES.includes(user.role);

        if (!isOwner && !isStaff) {
            return res.status(403).json({ error: 'You do not have permission to post messages in this ticket' });
        }

        // 3. Post with server-verified IDs
        const newMessage = await ticketService.addTicketMessage(ticketId, user.id, message, isStaff);
        return sendSuccess(res, newMessage, 'Message added');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const banUser = async (req: Request, res: Response) => {
    try {
        const { username, reason } = req.body;
        if (!username) return sendError(res, 'Username required', 'MISSING_FIELD', 400);

        // Sanitize reason: strip anything that could act as a command separator or
        // control char in the Minecraft console (; & | ` \ and CRLF). Prevents
        // command chaining via the ban reason (e.g. "x;op attacker").
        const sanitizedReason = String(reason || 'Banned via Web Panel')
            // eslint-disable-next-line no-control-regex -- intentionally stripping control chars
            .replace(/[;&|`\\\r\n\x00-\x1F]/g, '')
            .trim();

        // Validate the username again to ensure it conforms to Minecraft username pattern
        const usernameRegex = /^[A-Za-z0-9_]{3,16}$/;
        if (!usernameRegex.test(username)) {
            return sendError(res, 'Invalid Minecraft username', 'INVALID_FIELD', 400);
        }

        const cmd = `ban ${username} ${sanitizedReason}`;
        const result = await commandService.queueCommand(cmd);

        if (result.success) {
            logService.createLog({
                username: getLogUsername(req),
                action: 'BAN_USER',
                details: `Banned user ${username}. Reason: ${sanitizedReason}`,
                source: 'web'
            }).catch(console.error);

            return sendSuccess(res, { command: cmd }, `User ${username} banned successfully`);
        } else {
            return sendError(res, result.error || 'Bridge Error', 'BRIDGE_FAILED');
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const id = ensureString(req.params.id);
        await ticketService.deleteTicket(parseInt(id));

        logService.createLog({
            username: getLogUsername(req),
            action: 'DELETE_TICKET',
            details: `Deleted ticket #${id}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, null, "Ticket deleted successfully");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
