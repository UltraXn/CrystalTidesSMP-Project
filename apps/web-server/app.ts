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
import ragRoutes from './routes/ragRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import honeypotRoutes from './routes/honeypotRoutes.js';
import { checkCanaryToken } from './middleware/honeypotMiddleware.js';
import { initCleanupJob } from './services/cleanupService.js';

import helmet from 'helmet';
import { apiLimiter, uploadLimiter } from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/authRoutes.js';

import cookieParser from 'cookie-parser';
import { getEnv } from './config/env.js';
import { ALLOWED_ORIGINS, rejectCrossSiteWrites } from './middleware/csrfGuard.js';

const app = express();

// Trust Proxy: Cloud Run's front end is one hop. Cloudflare's client IP is
// resolved separately (utils/clientIp.ts). Add one hop per extra load balancer.
app.set('trust proxy', getEnv().TRUST_PROXY_HOPS);

// Security Middleware
// Strict CSP by default: this server serves JSON, so 'unsafe-inline' is never
// needed. The only HTML it serves is Swagger UI, which gets a scoped, relaxed
// CSP on its own route below (see /api/docs).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'wss://*.supabase.co',
          'wss://*.crystaltidessmp.net',
          'https://crystaltidessmp.net',
          'https://api.crystaltidessmp.net',
          'wss://*.crystaltides.net',
          'https://crystaltides.net',
          'https://api.crystaltides.net',
        ],
        frameSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'https://*.supabase.co',
          'https://mc-heads.net',
          'https://minotar.net',
        ],
        styleSrc: ["'self'"],
      },
    },
  }),
);
app.use('/api', apiLimiter); // Global limit for all API routes

import hpp from 'hpp';

// Middleware
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(rejectCrossSiteWrites());
app.use(cookieParser(getEnv().COOKIE_SECRET));
app.use(checkCanaryToken);
// JSON only: form-encoded bodies (what a cross-site <form> can send) are parsed
// just on the Ko-Fi webhook route.
app.use(express.json());

// Iniciar Jobs
initCleanupJob();
app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

// Routes
app.use('/', honeypotRoutes); // Stealth honeypot & scanner decoys
app.use('/api/system', systemRoutes);
app.use('/api/admin', uploadLimiter, adminRoutes); // Admin Mod Uploads
app.use('/api/webhooks', webhookRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/minecraft', minecraftRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
// Strict limiters live on the specific write/expensive routes inside each router:
// mounting them on a whole router would also throttle ordinary page loads.
app.use('/api/auth', authRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
import bountyRoutes from './routes/bountyRoutes.js';

app.use('/api/bounties', bountyRoutes);
app.use('/api/rules', ruleRoutes); // Interactive Rules
app.use('/api/policies', policyRoutes);
app.use('/api/profiles/comments', profileCommentRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/player-stats', playerStatsRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/server/status', serverStatusRoutes);
app.use('/api/bridge', bridgeRoutes); // Secure CrystalBridge
app.use('/api/gacha', gachaRoutes);

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
  app.use(
    '/api/docs',
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
      );
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );
}

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CrystalTides API',
    version: '1.0.0',
  });
});

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Catch 404 for unmapped routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

export default app;
