import * as userService from '../services/userService.js';
import * as logService from '../services/logService.js';
import * as playerStatsService from '../services/playerStatsService.js';
import * as forumService from '../services/forumService.js';

import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getRolePriority } from '../utils/roleUtils.js';
import supabase from '../config/supabaseClient.js';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const users = await userService.getAllUsers(search as string);
        return sendSuccess(res, users, 'Users listed successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!role) return sendError(res, 'Role is required', 'MISSING_FIELD', 400);

        // Security: Role Hierarchy Check
        // 1. Check if requester has authority
        const requestorRole = (req as any).user?.role;
        const requestorPriority = getRolePriority(requestorRole);
        const newRolePriority = getRolePriority(role);

        if (newRolePriority > requestorPriority) {
            return sendError(res, 'No tienes permiso para asignar un rango superior al tuyo', 'FORBIDDEN', 403);
        }

        // 2. Check if target user is protected (Higher or Equal rank)
        // We need to fetch the target user currently to check their role
        const { data: { user: targetUser }, error: fetchError } = await supabase.auth.admin.getUserById(id);
        
        if (fetchError || !targetUser) {
             return sendError(res, 'Usuario objetivo no encontrado', 'NOT_FOUND', 404);
        }

        const targetPriority = getRolePriority(targetUser.user_metadata?.role);

        // Allow SuperAdmins (100) to edit anyone (even other 100s, usually acceptable, or block equals? 
        // User request: "Staff no puedan cambiarse a un rango superior". 
        // We block if target >= requestor AND requestor < 100.
        // This allows 'killuwu' (100) to edit 'neroferno' (100), but blocks 'developer' (90) from editing 'developer' (90).
        if (targetPriority >= requestorPriority && requestorPriority < 100) {
            return sendError(res, 'No puedes modificar a un usuario con igual o mayor autoridad', 'FORBIDDEN', 403);
        }

        const updatedUser = await userService.updateUserRole(id, role);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_ROLE',
            details: `Updated user ${id} role to ${role}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, updatedUser, 'User role updated');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const updateUserMetadata = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { metadata } = req.body;
        
        if (!metadata) return sendError(res, 'Metadata object is required', 'MISSING_FIELD', 400);

        const updatedUser = await userService.updateUserMetadata(id, metadata);

        logService.createLog({
            username: 'Admin',
            action: 'UPDATE_METADATA',
            details: `Updated user ${id} metadata: ${JSON.stringify(metadata)}`,
            source: 'web'
        }).catch(console.error);

        return sendSuccess(res, updatedUser, 'User metadata updated');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const profile = await userService.getPublicProfile(username);
        if (!profile) return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
        return sendSuccess(res, profile);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

/**
 * Aggregated Endpoint: Profile + Stats + Wallet + Threads
 * Replaces the need for GraphQL by grouping all data in one response
 */
export const getFullProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const profile = await userService.getPublicProfile(username);

        if (!profile) return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);

        // Parallel Fetching of related data
        const [stats, wallet, threads] = await Promise.all([
            // Stats (Game Kills, Playtime) - uses Minecraft Nick implies profile.username
            profile.username ? playerStatsService.getPlayerStats(profile.username) : null,
            
            // Wallet (Coins) - uses UUID or Nick
            profile.minecraft_uuid ? playerStatsService.getMoney(profile.minecraft_uuid) : 0,

            // Forum Activity - uses Web User ID
            forumService.getUserThreads(profile.id)
        ]);

        return sendSuccess(res, {
            ...profile,
            game_stats: stats,
            wallet: { coins: wallet },
            forum: {
                threads: threads.slice(0, 5), // Limit to top 5
                total_threads: threads.length
            }
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
export const getStaffUsers = async (req: Request, res: Response) => {
    try {
        const staff = await userService.getStaffUsers();
        return sendSuccess(res, staff, 'Staff users fetched successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};

export const giveKarma = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const voterId = (req as Request & { user: { id: string } }).user.id; // From authenticateToken middleware

        if (id === voterId) {
            return sendError(res, 'No puedes darte karma a ti mismo', 'SELF_VOTE', 400);
        }

        const newReputation = await userService.giveKarma(id, voterId);
        return sendSuccess(res, { newReputation }, 'Karma dado exitosamente');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendError(res, message);
    }
};
