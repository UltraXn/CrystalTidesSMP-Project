import crypto from 'node:crypto';
import type { Duplex } from 'node:stream';
import type { IncomingMessage, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const MAX_CLIENTS = 10;
const MAX_PAYLOAD_BYTES = 4 * 1024;
const HEARTBEAT_INTERVAL_MS = 30_000;

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();
const awaitingPong = new WeakSet<WebSocket>();

const tokensMatch = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const extractBearerToken = (req: IncomingMessage): string | null => {
  const header = req.headers.authorization;
  return typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;
};

/**
 * Only the Minecraft plugin may subscribe. It proves itself with BRIDGE_WS_TOKEN
 * during the HTTP upgrade (read lazily: Vault secrets load after startup).
 * Without a configured token every upgrade is refused; the plugin still polls
 * the command queue every 10 seconds, so this only removes the fast path.
 */
const rejectionFor = (req: IncomingMessage): { status: number; reason: string } | null => {
  const expected = process.env.BRIDGE_WS_TOKEN;
  if (!expected) return { status: 503, reason: 'Service Unavailable' };

  const provided = extractBearerToken(req);
  if (!provided || !tokensMatch(provided, expected)) return { status: 401, reason: 'Unauthorized' };

  if (clients.size >= MAX_CLIENTS) return { status: 503, reason: 'Service Unavailable' };
  return null;
};

const refuseUpgrade = (socket: Duplex, status: number, reason: string) => {
  socket.write(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
};

const registerClient = (ws: WebSocket, req: IncomingMessage) => {
  const ip = req.socket.remoteAddress;
  console.log(`[WebSocket] Bridge client connected from ${ip}`);
  clients.add(ws);

  ws.on('pong', () => awaitingPong.delete(ws));

  ws.on('message', (message) => {
    // Payloads are never logged: they come from outside the process.
    if (message.toString() === 'ping') {
      ws.send('pong');
    }
  });

  ws.on('close', () => {
    console.log(`[WebSocket] Bridge client disconnected (${ip})`);
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(`[WebSocket] Error: ${error.message}`);
  });
};

// Drops connections that stopped answering protocol-level pings.
const sweepDeadClients = () => {
  for (const ws of clients) {
    if (awaitingPong.has(ws)) {
      clients.delete(ws);
      ws.terminate();
      continue;
    }
    awaitingPong.add(ws);
    ws.ping();
  }
};

export const initWebSocket = (server: Server) => {
  wss = new WebSocketServer({ noServer: true, maxPayload: MAX_PAYLOAD_BYTES });
  wss.on('connection', registerClient);

  server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const rejection = rejectionFor(req);
    if (rejection) {
      console.warn(
        `[WebSocket] Refused upgrade from ${req.socket.remoteAddress} (${rejection.status})`,
      );
      refuseUpgrade(socket, rejection.status, rejection.reason);
      return;
    }

    wss?.handleUpgrade(req, socket, head, (ws) => wss?.emit('connection', ws, req));
  });

  const heartbeat = setInterval(sweepDeadClients, HEARTBEAT_INTERVAL_MS);
  heartbeat.unref();
  server.on('close', () => clearInterval(heartbeat));

  console.log('[WebSocket] Server initialized');
};

const broadcast = (data: unknown) => {
  if (!wss) return;
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

export const sendToAll = (command: string) => {
  broadcast({ type: 'EXECUTE_COMMAND', command });
};
