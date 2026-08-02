import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: mysql.Pool;

if (process.env.MOCK_DATABASE === 'true') {
    console.warn('⚠️ [Database] Using Mock Database Pool (MOCK_DATABASE=true)');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockQueryHandler = async (sql: string, values?: any[]): Promise<[any, any]> => {
        const sqlUpper = sql.toUpperCase();
        
        // 1. SHOW TABLES
        if (sqlUpper.includes('SHOW TABLES')) {
            return [[{ Table_name: 'skins' }], []];
        }
        
        // 2. Skins query
        if (sqlUpper.includes('SELECT VALUE FROM') && sqlUpper.includes('WHERE NAME =')) {
            return [[{ Value: 'eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvM2Y1MDFlNWI3OWE5Mzg3MmU1ZjhlNWIyNTVkYjQ0OTRiMmNmMDlhZjI5MTlhMzQ0MGE5YTIyYTMxZjQyIn19fQ==' }], []];
        }
        
        // 3. Gacha balance query
        if (sqlUpper.includes('SELECT GACHA_BALANCE FROM')) {
            return [[{ gacha_balance: 1000 }], []];
        }
        
        // 4. Unlocked tiers query
        if (sqlUpper.includes('SELECT UNLOCKED_TIERS FROM')) {
            return [[{ unlocked_tiers: '["bronze", "silver"]' }], []];
        }
        
        // 5. Minecraft Name query
        if (sqlUpper.includes('SELECT MINECRAFT_NAME FROM')) {
            return [[{ minecraft_name: 'MockPlayer' }], []];
        }
        
        // 6. Linked account full query
        if (sqlUpper.includes('SELECT * FROM LINKED_ACCOUNTS')) {
            return [[{ 
                web_user_id: values?.[0] || 'mock-user-id',
                gacha_balance: 1000, 
                minecraft_name: 'MockPlayer', 
                unlocked_tiers: '["bronze", "silver"]',
                discord_id: '123456789012345678',
                discord_tag: 'MockUser#0000'
            }], []];
        }

        // 7. Mutating queries (UPDATE, INSERT, DELETE, ALTER, etc.)
        if (
            sqlUpper.startsWith('UPDATE') || 
            sqlUpper.startsWith('INSERT') || 
            sqlUpper.startsWith('DELETE') || 
            sqlUpper.startsWith('ALTER')
        ) {
            return [{ affectedRows: 1, insertId: 1, warningStatus: 0, changedRows: 1 }, []];
        }

        // Fallback for any other query
        return [[], []];
    };

    pool = {
        execute: mockQueryHandler,
        query: mockQueryHandler,
        getConnection: async () => ({
            query: mockQueryHandler,
            execute: mockQueryHandler,
            release: () => {}
        }),
        end: async () => {},
    } as unknown as mysql.Pool;
} else {
    pool = mysql.createPool({
        host: process.env.MC_DB_HOST,
        port: parseInt(process.env.MC_DB_PORT || '3306'),
        user: process.env.MC_DB_USER,
        password: process.env.MC_DB_PASSWORD,
        database: process.env.MC_DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000 // Timeout fast if DB is offline
    });
}

export default pool;
