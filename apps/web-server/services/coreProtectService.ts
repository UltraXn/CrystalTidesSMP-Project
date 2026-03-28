import pool from '../config/coreProtectDb.js';

export const getCommandLogs = async ({ page = 1, limit = 50, search = '' }) => {
    try {
        const offset = (page - 1) * limit;
        
        const suspiciousCommands = [
            '/gm', '/gamemode',
            '/give', '/item',
            '/xp', '/experience',
            '/enchant',
            '/tp', '/teleport',
            '//', // WorldEdit
            '/fly', '/god', '/heal', '/feed',
            '/op', '/deop',
            '/fill', '/setblock', '/clone',
            '/effect', '/attribute',
            '/ban', '/tempban', '/kick', '/mute', '/tempmute', '/unban', '/pardon',
            '/whitelist', '/vanish', '/v', '/invsee', '/endersee', '/sudo',
            '/stop', '/restart', '/reload', '/rl'
        ];

        const commandFilters = suspiciousCommands.map(() => `cmd.message LIKE ?`).join(' OR ');
        
        let query = `
            SELECT 
                cmd.time, 
                cmd.message, 
                u.user 
            FROM co_command cmd
            JOIN co_user u ON cmd.user = u.rowid
            WHERE (${commandFilters})
        `;

        const params: (string | number)[] = suspiciousCommands.map(cmd => `${cmd}%`);

        if (search) {
            query += ` AND (u.user LIKE ? OR cmd.message LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY cmd.time DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);

        let countQuery = `
            SELECT COUNT(*) as total 
            FROM co_command cmd
            JOIN co_user u ON cmd.user = u.rowid
            WHERE (${commandFilters})
        `;

        const countParams = suspiciousCommands.map(cmd => `${cmd}%`);

        if (search) {
            countQuery += ` AND (u.user LIKE ? OR cmd.message LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countRows]: any = await pool.query(countQuery, countParams);
        const total = countRows[0].total;

        return {
            data: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching CoreProtect logs:', error);
        throw error;
    }
};
