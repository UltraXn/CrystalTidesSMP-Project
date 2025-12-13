const express = require('express');
const router = express.Router();
const minecraftController = require('../controllers/minecraftController');

// GET /api/minecraft/status
router.get('/status', minecraftController.getStatus);

module.exports = router;
