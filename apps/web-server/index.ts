import dotenv from 'dotenv'; // Force deploy
dotenv.config();

import { initVault } from './services/vaultService.js';

// Load secrets from Vault before initializing the application
await initVault();

// Dynamically import application modules to ensure process.env is fully populated
const { default: app } = await import('./app.js');
const { createServer } = await import('http');
const { initWebSocket } = await import('./services/websocketService.js');

const PORT = process.env.PORT || 3001;
const server = createServer(app);

initWebSocket(server);

server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

