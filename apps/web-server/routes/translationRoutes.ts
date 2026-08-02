import express from 'express';
import { translateText } from '../services/translationService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { translateSchema } from '../schemas/translationSchemas.js';

const router = express.Router();

// Rate-limited + length-capped: each call costs Gemini API quota
router.post('/', authenticateToken, sensitiveActionLimiter, validate(translateSchema), async (req, res) => {
    const { text, targetLang } = req.body;

    try {
        const translated = await translateText(text, targetLang || 'en');
        res.json({ success: true, translatedText: translated });
    } catch (error) {
        console.error("Translation route error:", error);
        res.status(500).json({ error: "Translation failed" });
    }
});

export default router;
