const express = require('express');
const cors = require('cors');
const systemRoutes = require('./routes/systemRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const newsRoutes = require('./routes/newsRoutes'); // <--- Faltaba esto
const minecraftRoutes = require('./routes/minecraftRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const { initCleanupJob } = require('./services/cleanupService');

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

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CrystalTides API' });
});

module.exports = app;
