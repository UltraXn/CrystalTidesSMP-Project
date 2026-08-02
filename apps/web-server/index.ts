import dotenv from 'dotenv'; // Force deploy - trigger watcher reload
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { initVault } from './services/vaultService.js';
import { initWebSocket } from './services/websocketService.js';

const PORT = process.env.PORT || 3001;
const wrapperApp = express();
let realApp: express.Application | null = null;
let vaultRetryInterval: ReturnType<typeof setInterval> | null = null;
let shuttingDown = false;

// Delegate requests to the real app if loaded, otherwise return degraded/error responses
wrapperApp.use((req, res, next) => {
  if (realApp) {
    realApp(req, res, next);
  } else {
    // If the request is for the health check, return 200 with degraded status
    if (req.path === '/api/system/health' || req.path === '/api/system/ready') {
      const isReady = req.path.endsWith('/ready');
      res.status(isReady ? 503 : 200).json({
        status: isReady ? 'not_ready' : 'degraded',
        message: 'Vault is sealed or unreachable. Waiting for unseal.'
      });
    } else {
      res.status(503).json({
        status: 'error',
        message: 'Service Unavailable. Vault is currently sealed or unreachable. Please try again later.'
      });
    }
  }
});

const server = createServer(wrapperApp);
initWebSocket(server);

server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] received ${signal}, closing HTTP server...`);
  if (vaultRetryInterval) {
    clearInterval(vaultRetryInterval);
    vaultRetryInterval = null;
  }
  server.close((err) => {
    if (err) {
      console.error('[shutdown] error while closing server', err);
      process.exit(1);
      return;
    }
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[shutdown] forced exit after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function loadMainApp() {
  console.log('🔑 [Vault] Secrets loaded. Initializing main application...');
  const { default: app } = await import('./app.js');
  realApp = app;
  console.log('✅ [Vault] Main application initialized and fully operational.');
}

// Background initialization loop
async function startApp() {
  const success = await initVault();
  if (success) {
    try {
      await loadMainApp();
    } catch (error) {
      console.error('❌ [Vault] Failed to import/initialize main application after loading secrets:', error);
    }
  } else {
    console.warn('⚠️ [Vault] Vault is sealed or connection failed. Retrying in 10 seconds...');
    vaultRetryInterval = setInterval(async () => {
      const retrySuccess = await initVault();
      if (retrySuccess) {
        if (vaultRetryInterval) {
          clearInterval(vaultRetryInterval);
          vaultRetryInterval = null;
        }
        try {
          await loadMainApp();
        } catch (error) {
          console.error('❌ [Vault] Failed to import/initialize main application after loading secrets:', error);
        }
      } else {
        console.warn('⚠️ [Vault] Vault is still sealed or connection failed. Retrying in 10 seconds...');
      }
    }, 10000);
  }
}

startApp();
