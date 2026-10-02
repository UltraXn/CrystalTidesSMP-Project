import * as userService from '../services/userService.js';
import * as logService from '../services/logService.js';
import * as playerStatsService from '../services/playerStatsService.js';
import * as forumService from '../services/forumService.js';

import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getRolePriority, STAFF_ROLES } from '../utils/roleUtils.js';
import supabase from '../config/supabaseClient.js';
import { ensureString } from '../utils/typeUtils.js';

const CONSTANTS = {
  ADMIN_DEFAULT: 'Admin',
  SOURCE_WEB: 'web',
} as const;

const ERRORS = {
  MISSING_FIELD: { code: 'MISSING_FIELD', status: 400 },
  USER_NOT_FOUND: { message: 'User not found', code: 'USER_NOT_FOUND', status: 404 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  NOT_FOUND: { message: 'Usuario objetivo no encontrado', code: 'NOT_FOUND', status: 404 },
} as const;

const handleError = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return sendError(res, message);
};

const authorizeRoleUpdate = async (
  requestorRole: string | undefined,
  newRole: string,
  targetId: string,
) => {
  const requestorPriority = getRolePriority(requestorRole);
  const newRolePriority = getRolePriority(newRole);

  if (newRolePriority > requestorPriority) {
    return {
      error: 'No tienes permiso para asignar un rango superior al tuyo',
      code: ERRORS.FORBIDDEN.code,
      status: ERRORS.FORBIDDEN.status,
    };
  }

  const {
    data: { user: targetUser },
    error: fetchError,
  } = await supabase.auth.admin.getUserById(targetId);

  if (fetchError || !targetUser) {
    return {
      error: ERRORS.NOT_FOUND.message,
      code: ERRORS.NOT_FOUND.code,
      status: ERRORS.NOT_FOUND.status,
    };
  }

  const targetPriority = getRolePriority(targetUser.user_metadata?.role);

  if (targetPriority >= requestorPriority && requestorPriority < 100) {
    return {
      error: 'No puedes modificar a un usuario con igual o mayor autoridad',
      code: ERRORS.FORBIDDEN.code,
      status: ERRORS.FORBIDDEN.status,
    };
  }

  return null;
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const search = ensureString(req.query.search);
    const users = await userService.getAllUsers(search);
    return sendSuccess(res, users, 'Users listed successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { role } = req.body;

    if (!role)
      return sendError(
        res,
        'Role is required',
        ERRORS.MISSING_FIELD.code,
        ERRORS.MISSING_FIELD.status,
      );

    const requestorRole = req.user?.role;
    const authError = await authorizeRoleUpdate(requestorRole, role, id);
    if (authError) {
      return sendError(res, authError.error, authError.code, authError.status);
    }

    const updatedUser = await userService.updateUserRole(id, role);
    const requestorUsername = req.user?.username || CONSTANTS.ADMIN_DEFAULT;

    logService
      .createLog({
        username: requestorUsername,
        action: 'UPDATE_ROLE',
        details: `Updated user ${id} role to ${role}`,
        source: CONSTANTS.SOURCE_WEB,
      })
      .catch(console.error);

    return sendSuccess(res, updatedUser, 'User role updated');
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateUserMetadata = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { metadata } = req.body;

    if (!metadata)
      return sendError(
        res,
        'Metadata object is required',
        ERRORS.MISSING_FIELD.code,
        ERRORS.MISSING_FIELD.status,
      );

    const updatedUser = await userService.updateUserMetadata(id, metadata);
    const requestorUsername = req.user?.username || CONSTANTS.ADMIN_DEFAULT;

    logService
      .createLog({
        username: requestorUsername,
        action: 'UPDATE_METADATA',
        details: `Updated user ${id} metadata: ${JSON.stringify(metadata)}`,
        source: CONSTANTS.SOURCE_WEB,
      })
      .catch(console.error);

    return sendSuccess(res, updatedUser, 'User metadata updated');
  } catch (error) {
    return handleError(res, error);
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const username = ensureString(req.params.username);
    const profile = await userService.getPublicProfile(username);
    if (!profile)
      return sendError(
        res,
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.code,
        ERRORS.USER_NOT_FOUND.status,
      );
    return sendSuccess(res, profile);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Aggregated Endpoint: Profile + Stats + Wallet + Threads
 * Replaces the need for GraphQL by grouping all data in one response
 */
export const getFullProfile = async (req: Request, res: Response) => {
  try {
    const username = ensureString(req.params.username);
    const profile = await userService.getPublicProfile(username);

    if (!profile)
      return sendError(
        res,
        ERRORS.USER_NOT_FOUND.message,
        ERRORS.USER_NOT_FOUND.code,
        ERRORS.USER_NOT_FOUND.status,
      );

    const requesterRole = (req.user?.role || '').toLowerCase();
    const isOwner = req.user?.id === profile.id;
    const isStaff = STAFF_ROLES.includes(requesterRole);
    const canSeeWallet = isOwner || isStaff;

    const [stats, wallet, threads] = await Promise.all([
      profile.username ? playerStatsService.getPlayerStats(profile.username) : null,
      canSeeWallet && profile.minecraft_uuid
        ? playerStatsService.getMoney(profile.minecraft_uuid)
        : null,
      forumService.getUserThreads(profile.id),
    ]);

    return sendSuccess(res, {
      ...profile,
      game_stats: stats,
      ...(canSeeWallet ? { wallet: { coins: wallet } } : {}),
      forum: {
        threads: threads.slice(0, 5),
        total_threads: threads.length,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getStaffUsers = async (req: Request, res: Response) => {
  try {
    const staff = await userService.getStaffUsers();
    return sendSuccess(res, staff, 'Staff users fetched successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

export const giveKarma = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);

    if (!req.user?.id) {
      return sendError(
        res,
        'Usuario no autenticado',
        ERRORS.FORBIDDEN.code,
        ERRORS.FORBIDDEN.status,
      );
    }

    const voterId = req.user.id;

    if (id === voterId) {
      return sendError(res, 'No puedes darte karma a ti mismo', 'SELF_VOTE', 400);
    }

    const newReputation = await userService.giveKarma(id, voterId);
    return sendSuccess(res, { newReputation }, 'Karma dado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
};
