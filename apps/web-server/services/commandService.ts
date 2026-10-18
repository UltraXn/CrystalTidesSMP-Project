import pool from '../config/database.js';
import { sendToAll } from './websocketService.js';

/**
 * Adds a Minecraft command to the secure execution queue.
 * @param command - The command string to execute (without leading /).
 * @returns Object indicating success or failure.
 */
export const queueCommand = async (command: string) => {
  try {
    const [result] = await pool.query('INSERT INTO web_pending_commands (command) VALUES (?)', [
      command,
    ]);
    const insertId = (result as { insertId: number }).insertId;
    // Only the id: the command can carry relayed chat, and the full text is
    // already audited in system_logs by the bridge route.
    console.log(`[Command Queue] Queued command #${insertId}`);

    // Notify WebSocket clients (Plugin) to fetch immediately
    sendToAll('REFRESH_COMMANDS');

    return { success: true, id: insertId };
  } catch (error) {
    console.error('[Command Queue] Failed to queue command:', error);
    return { success: false, error: 'Database error' };
  }
};

/**
 * Queues multiple Minecraft commands sequentially.
 */
export const queueCommands = async (commands: string[]) => {
  if (commands.length === 0) return [];

  const results = [];
  for (const command of commands) {
    results.push(await queueCommand(command));
  }
  return results;
};
