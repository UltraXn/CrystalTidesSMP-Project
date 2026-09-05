const { spawn } = require('child_process');

const cp = spawn('npx.cmd', ['-y', 'mcp-remote', 'http://localhost:3000/bb-mcp'], {
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
});

cp.stdout.on('data', d => {
    console.log('[MCP STDOUT]:', d.toString());
});

cp.stderr.on('data', d => {
    console.error('[MCP STDERR]:', d.toString());
});

cp.on('error', err => {
    console.error('[MCP ERROR]:', err);
});

// 1. Send initialize
const initMsg = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'antigravity', version: '1.0' }
    }
}) + '\n';

cp.stdin.write(initMsg);

setTimeout(() => {
    const initializedNotification = JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized'
    }) + '\n';
    cp.stdin.write(initializedNotification);

    // Call get_project_info or list_outline
    const callMsg = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
            name: 'get_project_info',
            arguments: {}
        }
    }) + '\n';
    cp.stdin.write(callMsg);
}, 1500);

setTimeout(() => {
    // Capture screenshot if possible
    const shotMsg = JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
            name: 'capture_screenshot',
            arguments: {}
        }
    }) + '\n';
    cp.stdin.write(shotMsg);
}, 3000);

setTimeout(() => {
    cp.kill();
    process.exit(0);
}, 5000);
