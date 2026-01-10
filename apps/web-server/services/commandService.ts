import pool from '../config/database.js';
import { RowDataPacket } from 'mysql2';
import { sendToAll } from './websocketService.js';

interface CommandRow extends RowDataPacket {
    id: number;
    command: string;
    executed: number;
    executed_at: string;
    created_at: string;
}

/**
 * Adds a Minecraft command to the secure execution queue.
 * @param command - The command string to execute (without leading /).
 * @returns Object indicating success or failure.
 */
export const queueCommand = async (command: string) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO web_pending_commands (command) VALUES (?)',
            [command]
        );
        console.log(`[Command Queue] Queued command: ${command}`);
        
        // Notify WebSocket clients (Plugin) to fetch immediately
        sendToAll('REFRESH_COMMANDS');

        const insertId = (result as { insertId: number }).insertId;
        return { success: true, id: insertId };
    } catch (error) {
        console.error('[Command Queue] Failed to queue command:', error);
        return { success: false, error: 'Database error' };
    }
};

/**
 * Checks the status of a queued command.
 * @param id - The ID of the command to check.
 */
export const checkCommandStatus = async (id: number) => {
    try {
        const [rows] = await pool.query<CommandRow[]>(
            'SELECT * FROM web_pending_commands WHERE id = ?',
            [id]
        );
        const command = rows[0];
        if (!command) return null;
        return {
            executed: Boolean(command.executed),
            executed_at: command.executed_at
        };
    } catch (error) {
        console.error('[Command Queue] Failed to check status:', error);
        return null;
    }
};
