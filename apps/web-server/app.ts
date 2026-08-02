import express from 'express';
import cors from 'cors';
import systemRoutes from './routes/systemRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import minecraftRoutes from './routes/minecraftRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import discordRoutes from './routes/discordRoutes.js';
import logRoutes from './routes/logRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import playerStatsRoutes from './routes/playerStatsRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import serverStatusRoutes from './routes/serverStatusRoutes.js';
import bridgeRoutes from './routes/bridgeRoutes.js'; // Secure CrystalBridge
import taskRoutes from './routes/taskRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import gachaRoutes from './routes/gachaRoutes.js';
import translationRoutes from './routes/translationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import profileCommentRoutes from './routes/profileCommentRoutes.js';
import wikiRoutes from './routes/wikiRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import { initCleanupJob } from './services/cleanupService.js';

import helmet from 'helmet';
import { apiLimiter, sensitiveActionLimiter, uploadLimiter } from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Trust Proxy (Required for Rate Limiting behind Proxy/Load Balancer)
app.set('trust proxy', 1);

// Security Middleware
// Strict CSP by default: this server serves JSON, so 'unsafe-inline' is never
// needed. The only HTML it serves is Swagger UI, which gets a scoped, relaxed
// CSP on its own route below (see /api/docs).
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            connectSrc: [
                "'self'",
                "https://*.supabase.co",
                "wss://*.supabase.co",
                "wss://*.crystaltidessmp.net",
                "https://crystaltidessmp.net",
                "https://api.crystaltidessmp.net"
            ],
            frameSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://mc-heads.net", "https://minotar.net"],
            styleSrc: ["'self'"],
        },
    },
}));
app.use('/api', apiLimiter); // Global limit for all API routes

import hpp from 'hpp';

// Middleware
app.use(cors({
    origin: [
        'https://crystaltidessmp.net',
        'https://api.crystaltidessmp.net',
        'http://localhost:3000', // Local development
        'http://localhost:5173'  // Vite default
    ],
    credentials: true
}));
app.use(express.json());

// Iniciar Jobs
initCleanupJob();
app.use(express.urlencoded({ extended: true })); // Necesario para Ko-Fi payload
app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

// Routes
app.use('/api/system', systemRoutes);
app.use('/api/admin', uploadLimiter, adminRoutes); // Admin Mod Uploads
app.use('/api/webhooks', webhookRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/minecraft', minecraftRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', sensitiveActionLimiter, authRoutes);
app.use('/api/discord', sensitiveActionLimiter, discordRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/suggestions', sensitiveActionLimiter, suggestionRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rules', ruleRoutes); // Interactive Rules
app.use('/api/policies', policyRoutes);
app.use('/api/profiles/comments', profileCommentRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/player-stats', playerStatsRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/server/status', serverStatusRoutes);
app.use('/api/bridge', sensitiveActionLimiter, bridgeRoutes); // Secure CrystalBridge
app.use('/api/gacha', sensitiveActionLimiter, gachaRoutes);

import roadmapRoutes from './routes/roadmapRoutes.js';

app.use('/api/roadmap', roadmapRoutes);

// Staff Hub Routes
app.use('/api/staff/tasks', taskRoutes);
app.use('/api/staff/notes', noteRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/uploads', uploadRoutes); // Secure image uploads (magic-byte validated)

// Swagger Docs — disabled in production unless ENABLE_API_DOCS=true.
// A public API map is reconnaissance material for attackers.
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const docsEnabled = process.env.ENABLE_API_DOCS === 'true' || process.env.NODE_ENV !== 'production';
if (docsEnabled) {
    // Scoped relaxed CSP for Swagger UI only (it needs inline scripts/styles).
    // Overrides the strict global CSP for this path exclusively.
    app.use('/api/docs', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
        );
        next();
    }, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Base route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to CrystalTides API',
        version: '1.0.0'
    });
});

export default app;
