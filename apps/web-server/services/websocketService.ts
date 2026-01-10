import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export const initWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket, req) => {
        const ip = req.socket.remoteAddress;
        console.log(`[WebSocket] New connection from ${ip}`);
        
        // Simple authentication via header or query param could be added here
        // For now, we assume internal network or trusted plugin connection

        clients.add(ws);

        ws.on('message', (message) => {
            try {
                const msgString = message.toString();
                console.log(`[WebSocket] Received: ${msgString}`);
                // Handle Heartbeat or other messages from Plugin
                if (msgString === 'ping') {
                    ws.send('pong');
                }
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
            }
        });

        ws.on('close', () => {
            console.log(`[WebSocket] Client disconnected (${ip})`);
            clients.delete(ws);
        });

        ws.on('error', (error) => {
            console.error(`[WebSocket] Error: ${error.message}`);
        });
    });

    console.log('[WebSocket] Server initialized');
};

export const broadcast = (data: unknown) => {
    if (!wss) return;
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

export const sendToAll = (command: string) => {
     broadcast({ type: 'EXECUTE_COMMAND', command });
};
