import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false // Prevent command queuing if offline
};

let redis: Redis | null = null;

try {
    redis = new Redis(redisConfig);
    
    redis.on('error', (err: Error) => {
        console.warn('Redis Connection Error:', err.message);
    });

    redis.on('connect', () => {
        console.log('Successfully connected to Redis');
    });
} catch (e) {
    console.error('Failed to initialize Redis client:', e);
}

export default redis;
