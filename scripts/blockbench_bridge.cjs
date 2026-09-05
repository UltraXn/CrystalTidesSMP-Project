const http = require('http');
const crypto = require('crypto');

const sessionId = crypto.randomUUID();
console.log(`[Connecting to Blockbench MCP] Session ID: ${sessionId}`);

// 1. Establish SSE GET stream
const sseReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/bb-mcp',
    method: 'GET',
    headers: {
        'Accept': 'text/event-stream',
        'Mcp-Session-Id': sessionId
    }
}, (res) => {
    // console.log(`[SSE Connected] Status: ${res.statusCode}`);
    res.on('data', (chunk) => {
        const text = chunk.toString();
        console.log(`[SSE Event]:\n${text}`);
    });
});

sseReq.on('error', (e) => {
    console.error(`[SSE Error]: ${e.message}`);
});
sseReq.end();

// Helper to send POST RPC
function sendRPC(method, params = {}, id = null) {
    const payload = JSON.stringify({
        jsonrpc: '2.0',
        ...(id !== null ? { id } : {}),
        method,
        params
    });

    const postReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/bb-mcp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'Mcp-Session-Id': sessionId
        }
    }, (res) => {
        let body = '';
        res.on('data', (d) => body += d.toString());
        res.on('end', () => {
            console.log(`[POST Response (${method})]:\n${body}`);
        });
    });

    postReq.on('error', (e) => console.error(`[POST Error]: ${e.message}`));
    postReq.write(payload);
    postReq.end();
}

// 2. Workflow: Initialize -> Tool Call
setTimeout(() => {
    sendRPC('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'antigravity', version: '1.0' }
    }, 1);
}, 500);

setTimeout(() => {
    sendRPC('notifications/initialized', {});
    
    // Call tool
    sendRPC('tools/call', {
        name: process.argv[2] || 'get_project_info',
        arguments: process.argv[3] ? JSON.parse(process.argv[3]) : {}
    }, 2);
}, 1200);

setTimeout(() => {
    process.exit(0);
}, 3000);
