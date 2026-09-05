const crypto = require('crypto');

async function callBlockbenchMCP(toolName, args = {}) {
    // Step 1: Initialize MCP session
    const initRes = await fetch('http://localhost:3000/bb-mcp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'antigravity-client', version: '1.0.0' }
            }
        })
    });

    const initSessionId = initRes.headers.get('mcp-session-id') || initRes.headers.get('Mcp-Session-Id');
    const initJson = await initRes.json();
    // console.log('Session ID from header:', initSessionId);
    // console.log('Init JSON:', initJson);

    // Send initialized notification if needed
    await fetch('http://localhost:3000/bb-mcp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(initSessionId ? { 'Mcp-Session-Id': initSessionId } : {})
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'notifications/initialized'
        })
    });

    // Step 2: Call tool
    const toolRes = await fetch('http://localhost:3000/bb-mcp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(initSessionId ? { 'Mcp-Session-Id': initSessionId } : {})
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: args
            }
        })
    });

    const result = await toolRes.json();
    return result;
}

async function main() {
    const action = process.argv[2] || 'get_project_info';
    let params = {};
    if (process.argv[3]) {
        try {
            params = JSON.parse(process.argv[3]);
        } catch (e) {
            console.error('Invalid JSON params:', process.argv[3]);
        }
    }

    try {
        const res = await callBlockbenchMCP(action, params);
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error('Error calling Blockbench MCP:', err.message);
    }
}

main();
