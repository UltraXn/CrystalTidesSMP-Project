import express from 'express';
import { getStatus } from '../controllers/systemController.js';

const router = express.Router();

/** Liveness: process is up (Cloud Run / Docker HEALTHCHECK). */
router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

/** Readiness: app finished wiring routes after Vault secrets load. */
router.get('/ready', (_req, res) => {
    res.status(200).json({ status: 'ready' });
});

router.get('/status', getStatus);

export default router;
