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

const TICKET_MESSAGES = {
  NOT_FOUND: 'Ticket not found',
  UPDATE_DENIED: 'You do not have permission to update this ticket',
  VIEW_DENIED: 'You do not have permission to view this ticket',
  POST_DENIED: 'You do not have permission to post messages in this ticket',
  CREATED: 'Ticket created successfully',
  UPDATED: 'Ticket status updated',
  MESSAGE_ADDED: 'Message added',
  DELETED: 'Ticket deleted successfully',
} as const;

const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FIELD: 'INVALID_FIELD',
  BRIDGE_FAILED: 'BRIDGE_FAILED',
} as const;

const LOG_ACTIONS = {
  CREATE_TICKET: 'CREATE_TICKET',
  UPDATE_STATUS: 'UPDATE_STATUS',
  BAN_USER: 'BAN_USER',
  DELETE_TICKET: 'DELETE_TICKET',
} as const;

const LOG_SOURCE = 'web';

const getLogUsername = (req: Request) => {
  const user = (req as AuthenticatedRequest).user;
  return user?.username || user?.email || 'Unknown';
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const hasTicketAccess = (
  ticketUserId: string | number,
  user: NonNullable<AuthenticatedRequest['user']>,
): boolean => {
  return String(ticketUserId) === String(user.id) || STAFF_ROLES.includes(user.role);
};

// Admin: Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await ticketService.getAllTickets();
    return sendSuccess(res, tickets);
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};

// User: Create ticket
export const createTicket = async (req: Request, res: Response) => {
  try {
    const subject = req.body.subject || req.body.title;
    const { description, priority } = req.body;
    const user = (req as AuthenticatedRequest).user!;

    if (!subject) {
      return sendError(res, 'Missing subject', ERROR_CODES.MISSING_FIELD, 400);
    }

    const ticket = await ticketService.createTicket(user.id, { subject, description, priority });

    // Log
    logService
      .createLog({
        username: getLogUsername(req),
        action: LOG_ACTIONS.CREATE_TICKET,
        details: `Ticket #${ticket.id}: ${subject}`,
        source: LOG_SOURCE,
      })
      .catch(console.error);

    return sendSuccess(res, ticket, TICKET_MESSAGES.CREATED);
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};

// Admin/User: Update Status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { status } = req.body;
    const ticketId = Number.parseInt(id);
    const user = (req as AuthenticatedRequest).user!;

    // 1. Fetch ticket to check ownership
    const ticketInfo = await ticketService.getTicketById(ticketId);
    if (!ticketInfo) return sendError(res, TICKET_MESSAGES.NOT_FOUND, ERROR_CODES.NOT_FOUND, 404);

    // 2. Permission check
    if (!hasTicketAccess(ticketInfo.user_id, user)) {
      return res.status(403).json({ error: TICKET_MESSAGES.UPDATE_DENIED });
    }

    const ticket = await ticketService.updateTicketStatus(ticketId, status);

    logService
      .createLog({
        username: getLogUsername(req),
        action: LOG_ACTIONS.UPDATE_STATUS,
        details: `Ticket #${id} status changed to ${status}`,
        source: LOG_SOURCE,
      })
      .catch(console.error);

    return sendSuccess(res, ticket, TICKET_MESSAGES.UPDATED);
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};

// Get Stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await ticketService.getTicketStats();
    return sendSuccess(res, stats);
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};

// Get Messages
export const getMessages = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const ticketId = Number.parseInt(id);
    const user = (req as AuthenticatedRequest).user!;

    // 1. Fetch ticket to check ownership
    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) return sendError(res, TICKET_MESSAGES.NOT_FOUND, ERROR_CODES.NOT_FOUND, 404);

    // 2. Check Permissions
    if (!hasTicketAccess(ticket.user_id, user)) {
      return res.status(403).json({ error: TICKET_MESSAGES.VIEW_DENIED });
    }

    const messages = await ticketService.getTicketMessages(ticketId);
    return sendSuccess(res, messages);
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};

// Add Message
export const addMessage = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { message } = req.body;
    const ticketId = Number.parseInt(id);
    const user = (req as AuthenticatedRequest).user!;

    if (!message) return sendError(res, 'Message is required', ERROR_CODES.MISSING_FIELD, 400);

    // 1. Fetch ticket to check ownership
    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) return sendError(res, TICKET_MESSAGES.NOT_FOUND, ERROR_CODES.NOT_FOUND, 404);

    // 2. Permission check
    if (!hasTicketAccess(ticket.user_id, user)) {
      return res.status(403).json({ error: TICKET_MESSAGES.POST_DENIED });
    }

    // 3. Post with server-verified IDs
    const isStaff = STAFF_ROLES.includes(user.role);
    const newMessage = await ticketService.addTicketMessage(ticketId, user.id, message, isStaff);
    return sendSuccess(res, newMessage, TICKET_MESSAGES.MESSAGE_ADDED);
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { username, reason } = req.body;
    if (!username) return sendError(res, 'Username required', ERROR_CODES.MISSING_FIELD, 400);

    const sanitizedReason = String(reason || 'Banned via Web Panel')
      .replace(/[;&|`\\]/g, '')
      .split('')
      .filter((char) => char.charCodeAt(0) >= 32)
      .join('')
      .trim();

    const usernameRegex = /^\w{3,16}$/;
    if (!usernameRegex.test(username)) {
      return sendError(res, 'Invalid Minecraft username', ERROR_CODES.INVALID_FIELD, 400);
    }

    const cmd = `ban ${username} ${sanitizedReason}`;
    const result = await commandService.queueCommand(cmd);

    if (result.success) {
      logService
        .createLog({
          username: getLogUsername(req),
          action: LOG_ACTIONS.BAN_USER,
          details: `Banned user ${username}. Reason: ${sanitizedReason}`,
          source: LOG_SOURCE,
        })
        .catch(console.error);

      return sendSuccess(res, { command: cmd }, `User ${username} banned successfully`);
    } else {
      return sendError(res, result.error || 'Bridge Error', ERROR_CODES.BRIDGE_FAILED);
    }
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    await ticketService.deleteTicket(Number.parseInt(id));

    logService
      .createLog({
        username: getLogUsername(req),
        action: LOG_ACTIONS.DELETE_TICKET,
        details: `Deleted ticket #${id}`,
        source: LOG_SOURCE,
      })
      .catch(console.error);

    return sendSuccess(res, null, TICKET_MESSAGES.DELETED);
  } catch (error) {
    return sendError(res, getErrorMessage(error));
  }
};
