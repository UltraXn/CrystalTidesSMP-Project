import { Request, Response } from 'express';
import * as locationService from '../services/locationService.js';
import * as logService from '../services/logService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { ensureString } from '../utils/typeUtils.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// Constant definitions to prevent duplicate strings
const DEFAULT_COORDINATES = '???';
const MAX_COORDINATE_LENGTH = 100;
const DEFAULT_EDITOR_USERNAME = 'Admin';
const AUDIT_LOG_SOURCE = 'web';

const ACTION_CREATE_LOCATION = 'CREATE_LOCATION';
const ACTION_UPDATE_LOCATION = 'UPDATE_LOCATION';
const ACTION_DELETE_LOCATION = 'DELETE_LOCATION';

const ERR_FETCH_LOCATION = 'FETCH_ERROR';
const ERR_CREATE_LOCATION = 'CREATE_ERROR';
const ERR_UPDATE_LOCATION = 'UPDATE_ERROR';
const ERR_DELETE_LOCATION = 'DELETE_ERROR';
const ERR_MISSING_FIELDS = 'MISSING_FIELDS';

const MSG_LOCATION_CREATED = 'Location created successfully';
const MSG_LOCATION_UPDATED = 'Location updated successfully';
const MSG_LOCATION_DELETED = 'Location deleted successfully';
const MSG_TABLE_NOT_CREATED = 'Locations table not created yet';
const MSG_MISSING_REQUIRED_FIELDS = 'Missing required fields: title, description, long_description';
const TABLE_NOT_FOUND_ERR = 'relation "public.world_locations" does not exist';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
};

/**
 * Validates if coordinates string is non-empty and within bounds.
 */
export const isValidCoordinates = (coords: unknown): coords is string => {
  if (typeof coords !== 'string') return false;
  const trimmed = coords.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_COORDINATE_LENGTH;
};

/**
 * Validates and normalizes coordinates, falling back to '???' if invalid.
 */
export const resolveCoordinates = (coords: unknown): string => {
  return isValidCoordinates(coords) ? coords.trim() : DEFAULT_COORDINATES;
};

const hasRequiredFields = (
  title?: unknown,
  description?: unknown,
  longDescription?: unknown,
): boolean => {
  return Boolean(title && description && longDescription);
};

const logLocationAudit = (req: Request, action: string, details: string): void => {
  const editor = (req as AuthenticatedRequest).user;
  logService
    .createLog({
      user_id: editor?.id || undefined,
      username: editor?.username || DEFAULT_EDITOR_USERNAME,
      action,
      details,
      source: AUDIT_LOG_SOURCE,
    })
    .catch(console.error);
};

export const getLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await locationService.getAllLocations();
    return sendSuccess(res, locations);
  } catch (error) {
    console.error('Error in getLocations:', error);
    const message = getErrorMessage(error);
    if (message.includes(TABLE_NOT_FOUND_ERR)) {
      return sendSuccess(res, [], MSG_TABLE_NOT_CREATED);
    }
    return sendError(res, message, ERR_FETCH_LOCATION, 500, error);
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      long_description,
      coords,
      image_url,
      is_coming_soon,
      authors,
      sort_order,
    } = req.body;

    if (!hasRequiredFields(title, description, long_description)) {
      return sendError(res, MSG_MISSING_REQUIRED_FIELDS, ERR_MISSING_FIELDS, 400);
    }

    const newLocation = await locationService.createLocation({
      title,
      description,
      long_description,
      coords: resolveCoordinates(coords),
      image_url: image_url ?? null,
      is_coming_soon: is_coming_soon ?? false,
      authors: authors ?? [],
      sort_order: sort_order ?? 0,
    });

    logLocationAudit(req, ACTION_CREATE_LOCATION, `Created location: ${title}`);
    return sendSuccess(res, newLocation, MSG_LOCATION_CREATED);
  } catch (error) {
    console.error('Error in createLocation:', error);
    const message = getErrorMessage(error);
    return sendError(res, message, ERR_CREATE_LOCATION, 500, error);
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const numericId = Number.parseInt(id, 10);
    const updates = req.body;

    if (updates && typeof updates === 'object' && updates.coords !== undefined) {
      updates.coords = resolveCoordinates(updates.coords);
    }

    const updatedLocation = await locationService.updateLocation(numericId, updates);
    logLocationAudit(
      req,
      ACTION_UPDATE_LOCATION,
      `Updated location #${id}: ${updatedLocation.title}`,
    );
    return sendSuccess(res, updatedLocation, MSG_LOCATION_UPDATED);
  } catch (error) {
    console.error('Error in updateLocation:', error);
    const message = getErrorMessage(error);
    return sendError(res, message, ERR_UPDATE_LOCATION, 500, error);
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const numericId = Number.parseInt(id, 10);

    await locationService.deleteLocation(numericId);
    logLocationAudit(req, ACTION_DELETE_LOCATION, `Deleted location #${id}`);
    return sendSuccess(res, null, MSG_LOCATION_DELETED);
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    const message = getErrorMessage(error);
    return sendError(res, message, ERR_DELETE_LOCATION, 500, error);
  }
};
