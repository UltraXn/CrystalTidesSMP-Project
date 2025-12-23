import express, { Request, Response } from 'express';
import util from 'minecraft-server-util';

const router = express.Router();

// Route: Get Live Server Status (Online/Offline, Player Count, List)
// Endpoint: /api/status/live
router.get('/live', async (req: Request, res: Response) => {
    const host = process.env.MC_SERVER_HOST || 'localhost';
    const port = parseInt(process.env.MC_SERVER_PORT as string) || 25565;

    try {
        // Use Java Status (Query Protocol) - Fast & Standard
        const result = await util.status(host, port, { 
            timeout: 3000, 
            enableSRV: true 
        });
        
        // Success
        res.json({
            online: true,
            motd: result.motd.clean,
            version: result.version.name,
            players: {
                online: result.players.online,
                max: result.players.max,
                sample: result.players.sample || [] // List of names if provided
            },
            icon: result.favicon // Base64 icon
        });

    } catch (error: any) {
        console.warn(`[Server Status] Check Failed: ${error.message}`);
        
        // Fallback: Return offline structure so frontend handles it gracefully
        res.json({
            online: false,
            motd: "Server Unreachable",
            version: "Unknown",
            players: {
                online: 0,
                max: 0,
                sample: []
            },
            error: error.message
        });
    }
});

export default router;
