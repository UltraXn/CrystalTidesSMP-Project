import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

// Route: Get Server Resources (Stubbed - Legacy)
router.get('/resources', authenticateToken, checkRole(STAFF_ROLES), async (req: Request, res: Response) => {
    res.json({
        status: "offline",
        memory: { current: 0, limit: 0 },
        cpu: 0,
        disk: 0,
        online: 0,
        total_players: 0,
        new_players: 0,
        total_playtime_hours: 0,
        message: "Servicio de monitoreo (Pterodactyl/MySQL) discontinuado."
    });
});

// Route: Get Online Staff (Stubbed - Legacy)
router.get('/staff', async (req: Request, res: Response) => {
    res.json([]);
});



export default router;
