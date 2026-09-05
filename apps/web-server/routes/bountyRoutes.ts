import { Router, Request, Response } from 'express';

const router = Router();

// In-memory active Flash Bounty state (Synced with Supabase in production)
let activeBounty = {
  id: 'bounty-ignis-001',
  bossId: 'ignis',
  bossName: 'Ignis (Jefe Imperial del Fuego)',
  location: 'Altar Imperial del Nether',
  multiplier: '2.5x KC',
  rewardKc: 5000,
  model3dUrl: '/models/cataclysm/ignis.gltf',
  startsAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour duration
  status: 'ACTIVE',
  recentKillsCount: 3
};

/**
 * GET /api/bounties/active
 * Returns current active Flash Bounty for Web, Launcher, and Minecraft Server Plugin/Mod
 */
router.get('/active', (_req: Request, res: Response) => {
  const now = new Date();
  const expiresAt = new Date(activeBounty.expiresAt);
  const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

  res.json({
    success: true,
    bounty: {
      ...activeBounty,
      remainingSeconds,
      isExpired: remainingSeconds <= 0
    }
  });
});

/**
 * POST /api/bounties/trigger (Admin / Cronjob Trigger)
 */
router.post('/trigger', (req: Request, res: Response) => {
  const { bossName, multiplier, durationMinutes } = req.body || {};

  activeBounty = {
    id: `bounty-${Date.now()}`,
    bossId: bossName ? bossName.toLowerCase().replace(/\s+/g, '-') : 'netherite-monstrosity',
    bossName: bossName || 'Netherite Monstrosity',
    location: 'Mazmorra de Netherita del Nether',
    multiplier: multiplier || '3.0x KC',
    rewardKc: 7500,
    model3dUrl: '/models/cataclysm/netherite_monstrosity.gltf',
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + (durationMinutes || 60) * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    recentKillsCount: 0
  };

  res.json({
    success: true,
    message: 'Flash Bounty disparada con éxito.',
    bounty: activeBounty
  });
});

export default router;
