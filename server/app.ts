import express from 'express';
import cors from 'cors';
import systemRoutes from './routes/systemRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import minecraftRoutes from './routes/minecraftRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logRoutes from './routes/logRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import playerStatsRoutes from './routes/playerStats.js';
import serverRoutes from './routes/serverRoutes.js';
import serverStatusRoutes from './routes/serverStatus.js';
import taskRoutes from './routes/taskRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import { initCleanupJob } from './services/cleanupService.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Iniciar Jobs
initCleanupJob();
app.use(express.urlencoded({ extended: true })); // Necesario para Ko-Fi payload

// Routes
app.use('/api/system', systemRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/minecraft', minecraftRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/player-stats', playerStatsRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/server/status', serverStatusRoutes);

// Staff Hub Routes
app.use('/api/staff/tasks', taskRoutes);
app.use('/api/staff/notes', noteRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CrystalTides API' });
});

export default app;
