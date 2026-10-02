import * as eventService from '../services/eventService.js';
import * as logService from '../services/logService.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

const EVENT_CONSTANTS = {
  DEFAULT_ADMIN: 'Admin',
  DEFAULT_USER: 'User',
  SOURCE_WEB: 'web',
  UNAUTHORIZED: 'Unauthorized',
  EVENT_DELETED_MSG: 'Evento eliminado',
  ACTIONS: {
    CREATE_EVENT: 'CREATE_EVENT',
    UPDATE_EVENT: 'UPDATE_EVENT',
    DELETE_EVENT: 'DELETE_EVENT',
    EVENT_REGISTER: 'EVENT_REGISTER',
  },
} as const;

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface EventRecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number;
  count?: number;
  until?: string | Date;
}

export interface RecurringEventSchedule {
  startDate: Date;
  endDate?: Date;
  recurrence: EventRecurrenceRule;
}

/**
 * Checks whether an event definition has a valid recurrence rule configured.
 */
export const isRecurringEvent = (event: { recurrence?: unknown } | null | undefined): boolean => {
  if (!event || typeof event !== 'object') return false;
  const recurrence = (event as { recurrence?: unknown }).recurrence;
  if (!recurrence || typeof recurrence !== 'object') return false;
  const freq = (recurrence as { frequency?: unknown }).frequency;
  return (
    typeof freq === 'string' && ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'].includes(freq)
  );
};

/**
 * Computes the next occurrence date for a given recurrence frequency and interval.
 */
export const calculateNextOccurrence = (
  baseDate: Date | string,
  frequency: RecurrenceFrequency,
  interval: number = 1,
): Date => {
  const nextDate = new Date(baseDate);
  const step = Math.max(1, interval);

  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + step);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + step * 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + step * 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + step);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + step);
      break;
    default:
      break;
  }

  return nextDate;
};

/**
 * Generates an array of recurrence occurrence dates based on an event recurrence rule.
 */
export const generateRecurrenceOccurrences = (
  startDate: Date | string,
  rule: EventRecurrenceRule,
  maxLimit: number = 10,
): Date[] => {
  const occurrences: Date[] = [];
  const limit = Math.min(Math.max(1, rule.count ?? maxLimit), 50);
  const untilTimestamp = rule.until ? new Date(rule.until).getTime() : Number.POSITIVE_INFINITY;

  let currentDate = new Date(startDate);

  while (occurrences.length < limit) {
    const nextOccurrence = calculateNextOccurrence(currentDate, rule.frequency, rule.interval ?? 1);
    if (nextOccurrence.getTime() > untilTimestamp) {
      break;
    }
    occurrences.push(nextOccurrence);
    currentDate = nextOccurrence;
  }

  return occurrences;
};

interface EventAuditParams {
  username: string;
  action: string;
  details: string;
  userId?: string;
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const sendErrorResponse = (res: Response, error: unknown, statusCode = 500): Response => {
  return res.status(statusCode).json({ error: getErrorMessage(error) });
};

const parseNumericId = (rawId: unknown): number => {
  return Number.parseInt(ensureString(rawId), 10);
};

const getRequestorUsername = (req: Request, fallback = EVENT_CONSTANTS.DEFAULT_ADMIN): string => {
  return req.user?.username || fallback;
};

const dispatchEventAuditLog = (params: EventAuditParams): void => {
  logService
    .createLog({
      user_id: params.userId,
      username: params.username,
      action: params.action,
      details: params.details,
      source: EVENT_CONSTANTS.SOURCE_WEB,
    })
    .catch(console.error);
};

export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating event - Body received:', JSON.stringify(req.body));
    const event = await eventService.createEvent(req.body);
    const requestorUsername = getRequestorUsername(req);

    dispatchEventAuditLog({
      username: requestorUsername,
      action: EVENT_CONSTANTS.ACTIONS.CREATE_EVENT,
      details: `Created event: ${event.title}`,
    });

    res.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    sendErrorResponse(res, error);
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseNumericId(req.params.id);
    const event = await eventService.updateEvent(eventId, req.body);
    const requestorUsername = getRequestorUsername(req);

    dispatchEventAuditLog({
      username: requestorUsername,
      action: EVENT_CONSTANTS.ACTIONS.UPDATE_EVENT,
      details: `Updated event: ${event.title}`,
    });

    res.json(event);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseNumericId(req.params.id);
    const requestorUsername = getRequestorUsername(req);
    await eventService.deleteEvent(eventId);

    dispatchEventAuditLog({
      username: requestorUsername,
      action: EVENT_CONSTANTS.ACTIONS.DELETE_EVENT,
      details: `Deleted event ID: ${ensureString(req.params.id)}`,
    });

    res.json({ message: EVENT_CONSTANTS.EVENT_DELETED_MSG });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: EVENT_CONSTANTS.UNAUTHORIZED });
      return;
    }

    const eventId = parseNumericId(req.params.id);
    const registration = await eventService.registerUser(eventId, user.id);

    dispatchEventAuditLog({
      userId: user.id,
      username: user.username || EVENT_CONSTANTS.DEFAULT_USER,
      action: EVENT_CONSTANTS.ACTIONS.EVENT_REGISTER,
      details: `Registered for event ${ensureString(req.params.id)}`,
    });

    res.json(registration);
  } catch (error) {
    sendErrorResponse(res, error, 400);
  }
};

export const getUserRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: EVENT_CONSTANTS.UNAUTHORIZED });
      return;
    }

    const registrationIds = await eventService.getUserRegistrations(user.id);
    res.json(registrationIds);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getEventRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseNumericId(req.params.id);
    const registrations = await eventService.getRegistrations(eventId);
    res.json(registrations);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};
