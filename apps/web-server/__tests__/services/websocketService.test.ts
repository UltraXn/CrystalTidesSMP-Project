import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { WebSocket } from 'ws';
import { initWebSocket, sendToAll } from '../../services/websocketService.js';

const TOKEN = 'bridge-test-token-0123456789abcdef';

let server: http.Server;
let url: string;

/** Resolves with 101 and the socket once open, or with the HTTP status of a refused upgrade. */
const connect = (headers: Record<string, string> = {}) =>
  new Promise<{ status: number; ws?: WebSocket }>((resolve, reject) => {
    const ws = new WebSocket(url, { headers });
    ws.once('open', () => resolve({ status: 101, ws }));
    ws.once('unexpected-response', (_req, res) => resolve({ status: res.statusCode ?? 0 }));
    ws.once('error', reject);
  });

const connectAsPlugin = async (): Promise<WebSocket> => {
  const { status, ws } = await connect({ Authorization: `Bearer ${TOKEN}` });
  expect(status).toBe(101);
  return ws as WebSocket;
};

beforeEach(async () => {
  process.env.BRIDGE_WS_TOKEN = TOKEN;
  server = http.createServer();
  initWebSocket(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  url = `ws://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  delete process.env.BRIDGE_WS_TOKEN;
  server.closeAllConnections();
  server.close();
  await once(server, 'close');
});

describe('Bridge WebSocket', () => {
  it('refuses clients without the bridge token', async () => {
    expect((await connect()).status).toBe(401);
    expect((await connect({ Authorization: 'Bearer wrong-token' })).status).toBe(401);
  });

  it('refuses every client while no token is configured', async () => {
    delete process.env.BRIDGE_WS_TOKEN;

    expect((await connect({ Authorization: `Bearer ${TOKEN}` })).status).toBe(503);
  });

  it('lets the plugin in, answers its heartbeat and delivers queue notifications', async () => {
    const ws = await connectAsPlugin();

    ws.send('ping');
    const [pong] = await once(ws, 'message');
    expect(pong.toString()).toBe('pong');

    sendToAll('REFRESH_COMMANDS');
    const [notification] = await once(ws, 'message');
    expect(JSON.parse(notification.toString())).toEqual({
      type: 'EXECUTE_COMMAND',
      command: 'REFRESH_COMMANDS',
    });

    ws.close();
  });

  it('closes connections that send oversized messages', async () => {
    const ws = await connectAsPlugin();

    ws.send('x'.repeat(8 * 1024));
    const [code] = await once(ws, 'close');

    expect(code).toBe(1009);
  });
});
