const ticketService = require('../services/ticketService');

// Admin: Get all tickets
const getAllTickets = async (req, res) => {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User: Create ticket
const createTicket = async (req, res) => {
    try {
        const { user_id, subject, description, priority } = req.body;

        if (!user_id || !subject) {
            return res.status(400).json({ error: 'Missing user_id or subject' });
        }

        const ticket = await ticketService.createTicket(user_id, { subject, description, priority });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update Status
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await ticketService.updateTicketStatus(id, status);
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Stats
const getStats = async (req, res) => {
    try {
        const stats = await ticketService.getTicketStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Messages
const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await ticketService.getTicketMessages(id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Message
const addMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, message, is_staff } = req.body;

        if (!message) return res.status(400).json({ error: "Message is required" });

        const newMessage = await ticketService.addTicketMessage(id, user_id, message, is_staff);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ban User (via Minecraft Service)
const minecraftService = require('../services/minecraftService');

const banUser = async (req, res) => {
    try {
        const { username, reason } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const cmd = `ban ${username} ${reason || 'Banned via Web Panel'}`;
        const result = await minecraftService.sendCommand(cmd);

        if (result.success) {
            res.json({ message: `User ${username} banned successfully` });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllTickets,
    createTicket,
    updateStatus,
    getStats,
    getMessages,
    addMessage,
    banUser
};
