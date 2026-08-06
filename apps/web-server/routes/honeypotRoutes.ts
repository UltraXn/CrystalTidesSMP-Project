import { Router, Request, Response } from 'express';
import { triggerHoneypot } from '../middleware/honeypotMiddleware.js';

const router = Router();

// Decoy probe list for automated scanners & vulnerability crawlers
const DECOY_PATHS = [
    '/wp-login.php',
    '/wp-admin',
    '/admin.php',
    '/phpmyadmin',
    '/xmlrpc.php',
    '/.env',
    '/.env.local',
    '/.git/config',
    '/.git/HEAD',
    '/config.json',
    '/api/v1/debug/env',
    '/api/v1/admin/dump-db',
    '/server-status',
    '/actuator/health'
];

// Register honeypot handlers for all decoy paths
DECOY_PATHS.forEach((path) => {
    router.all(path, (req: Request, res: Response) => {
        triggerHoneypot(`Automated Scanner Decoy Probe ('${path}')`, req, res);
    });
});

// DOM Crawler Trap (linked invisibly in client DOM)
router.get('/api/honeypot/crawler-trap', (req: Request, res: Response) => {
    triggerHoneypot('DOM Crawler Invisible Link Trap Hit', req, res);
});

export default router;
