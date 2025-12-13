const util = require('minecraft-server-util');

const options = {
    timeout: 5000, // timeout in milliseconds
    enableSRV: true // SRV record lookup
};

/**
 * Obtiene el estado actual del servidor de Minecraft (Java Edition)
 * @param {string} host - La dirección IP del servidor
 * @param {number} port - El puerto del servidor (default: 25565)
 * @returns {Promise<object>} - Datos del servidor (players, version, favicon, etc.)
 */
const getServerStatus = async (host, port = 25565) => {
    try {
        const result = await util.status(host, port, options);

        // Limpiamos y formateamos la respuesta para que sea fácil de usar en el frontend
        return {
            online: true,
            version: result.version.name,
            players: {
                online: result.players.online,
                max: result.players.max,
                list: result.players.sample || [] // Lista de nombres (si el server la envía)
            },
            motd: result.motd.clean, // Texto plano sin códigos de color
            motdHtml: result.motd.html, // Texto con colores HTML (útil para la web)
            favicon: result.favicon, // Base64 image
            ping: result.roundTripLatency
        };
    } catch (error) {
        console.error('Error fetching Minecraft server status:', error.message);
        // Devolvemos un objeto indicando que está offline, en lugar de crashear
        return {
            online: false,
            error: "Server offline or unreachable"
        };
    }
};



/**
 * Send a command to the Minecraft server via Pterodactyl API
 * @param {string} command - Command to execute (without /)
 */
const sendCommand = async (command) => {
    try {
        const apiKey = process.env.PTERODACTYL_API_KEY;
        const serverId = process.env.PTERODACTYL_SERVER_ID;
        // Default to holy.gg panel, but allow override
        const host = process.env.PTERODACTYL_HOST || 'https://panel.holy.gg';

        if (!apiKey || !serverId) {
            console.error("Missing Pterodactyl credentials");
            return { success: false, error: "Configuration missing" };
        }

        const response = await fetch(`${host}/api/client/servers/${serverId}/command`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ command })
        });

        if (response.ok) {
            return { success: true };
        } else {
            const err = await response.text();
            console.error("Pterodactyl API Error:", err);
            return { success: false, error: "API Error" };
        }
    } catch (error) {
        console.error("Failed to send command:", error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getServerStatus,
    sendCommand
};
