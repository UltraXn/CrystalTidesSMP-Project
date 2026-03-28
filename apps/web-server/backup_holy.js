import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

// Credentials from .env
const DB_GENERAL = {
    host: '147.135.31.144',
    user: 'u41940_4IK2yBjoeK',
    password: 'uC1JJyme=Kx.yWm=fMfJ=F@q',
    database: 's41940_Base-General'
};

const DB_SPECIALIZED = {
    host: '147.135.31.144',
    user: 'u41940_sZah3jZrcn',
    password: 'sXKJC@Ed!zcNzWiHrklV9omJ',
    database: 's41940_Base-Especializada'
};

const BACKUP_DIR = 'C:/Users/nacho/Desktop/Portafolio/crystaltides/CrystalTidesSMP SV DEV/BBDDHOLY';

async function backupDatabase(config, label) {
    console.log(`\n📦 Starting backup for ${label}...`);
    let connection;
    try {
        connection = await mysql.createConnection(config);
        const [tables] = await connection.query('SHOW TABLES');
        
        for (const row of tables) {
            const tableName = Object.values(row)[0];
            
            // Skip massive tables that crash Node.js memory
            const SKIP_TABLES = ['co_block', 'co_container', 'co_item', 'co_entry', 'co_sign', 'co_skull', 'co_entity'];
            if (SKIP_TABLES.includes(tableName)) {
                console.log(`   ⚠️ Skipping massive table: ${tableName}`);
                continue;
            }

            console.log(`   - Dumping ${tableName}...`);
            
            // Get data
            const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
            
            // Save to JSON
            const filePath = path.join(BACKUP_DIR, `${linkTableName(label, tableName)}.json`);
            await fs.writeFile(filePath, JSON.stringify(rows, null, 2));
        }
        console.log(`✅ ${label} Backup Complete!`);
    } catch (err) {
        console.error(`❌ Error backing up ${label}:`, err);
    } finally {
        if (connection) await connection.end();
    }
}

function linkTableName(dbLabel, tableName) {
    // Optional: Prefix tables with DB name if collisions expected
    // For now keeping original names as requested
    return tableName;
}

async function main() {
    // Ensure dir exists
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch {
        // Ignored: Directory might already exist
    }

    await backupDatabase(DB_GENERAL, 'General');
    await backupDatabase(DB_SPECIALIZED, 'Specialized');
}

main();
