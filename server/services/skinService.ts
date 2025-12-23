import pool from '../config/database.js';

let cachedTableName: string | null = null;

const findSkinTable = async () => {
    if (cachedTableName) return cachedTableName;

    try {
        const [rows]: any[] = await pool.query('SHOW TABLES');
        // Rows is [{ Tables_in_dbname: 'tablename' }, ...]
        // We look for 'skins' case insensitive
        for (const row of rows) {
            const tableName = Object.values(row)[0] as string;
            if (tableName.toLowerCase().includes('skins')) {
                cachedTableName = tableName;
                return tableName;
            }
        }
    } catch (error) {
        console.error('Error finding skin table:', error);
    }
    return null;
};

const getSkinCrafatar = (username: string) => {
    return `https://crafatar.com/skins/${username}`; // Fallback URL
};

const getSkinMinotar = (username: string) => {
    return `https://minotar.net/skin/${username}`;
};

const getSkinFromDb = async (username: string) => {
    try {
        const tableName = await findSkinTable();
        if (!tableName) return null; // No table found

        // SkinsRestorer typically has columns: Nick, Value, Signature, Timestamp
        // Nick is the player name (lowercase usually?)
        
        const [rows]: any[] = await pool.query(`SELECT Value FROM ${tableName} WHERE Name = ?`, [username]);
        
        if (rows.length > 0) {
            const textureBase64 = rows[0].Value;
            return {
                type: 'custom',
                texture: textureBase64
            };
        }
    } catch (error) {
        console.error('Error querying skin from DB:', error);
    }
    return null;
};

/**
 * Get skin URL for a username.
 * Priority:
 * 1. SkinsRestorer DB (Custom)
 * 2. Mojang (via Minotar/Crafatar - used if not in SR or if we want premium fallback)
 * 
 * Note: SkinsRestorer stores the signed texture property.
 * We need to decode the Value to get the actual image URL.
 */
export const getSkinUrl = async (username: string) => {
    // 1. Check DB
    const dbSkin = await getSkinFromDb(username);
    if (dbSkin && dbSkin.texture) {
        try {
            // Decode Base64
            const jsonStr = Buffer.from(dbSkin.texture, 'base64').toString('utf-8');
            const data = JSON.parse(jsonStr);
            if (data.textures && data.textures.SKIN && data.textures.SKIN.url) {
                return { url: data.textures.SKIN.url, source: 'restorer' };
            }
        } catch (e) {
            console.error('Failed to parse skin data:', e);
        }
    }

    // 2. Fallback to Minotar (Premium)
    return { url: getSkinMinotar(username), source: 'minotar' };
};
