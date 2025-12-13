const minecraftService = require('../services/minecraftService');

const getStatus = async (req, res) => {
    try {
        const host = process.env.MC_SERVER_HOST || 'localhost';
        const port = parseInt(process.env.MC_SERVER_PORT || '25565');

        const status = await minecraftService.getServerStatus(host, port);

        res.json(status);
    } catch (error) {
        res.status(500).json({
            online: false,
            error: 'Internal server error fetching status'
        });
    }
};

module.exports = {
    getStatus
};
