import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MC_DB_HOST,
    port: parseInt(process.env.MC_DB_PORT || '3306'),
    user: process.env.MC_DB_USER,
    password: process.env.MC_DB_PASSWORD,
    database: process.env.MC_DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
