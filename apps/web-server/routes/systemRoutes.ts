import express from 'express';
import { getStatus, getReadiness } from '../controllers/systemController.js';

const router = express.Router();

/** Liveness: process is up (Cloud Run / Docker HEALTHCHECK). */
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

/** Readiness: verifies live database connections (MySQL and Supabase). */
router.get('/ready', getReadiness);

router.get('/status', getStatus);

export default router;
