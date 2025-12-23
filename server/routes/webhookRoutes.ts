import express from 'express';
import { handleKofiWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/kofi', handleKofiWebhook);

export default router;
