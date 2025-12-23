import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.CP_DB_HOST,
    port: Number(process.env.CP_DB_PORT) || 3306,
    user: process.env.CP_DB_USER,
    password: process.env.CP_DB_PASSWORD,
    database: process.env.CP_DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool.promise();
