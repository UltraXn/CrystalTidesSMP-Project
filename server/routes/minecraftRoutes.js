const express = require('express');
const router = express.Router();
const minecraftController = require('../controllers/minecraftController');

// GET /api/minecraft/status
router.get('/status', minecraftController.getStatus);
router.get('/skin/:username', minecraftController.getSkin);

// POST /api/minecraft/link
router.post('/link', minecraftController.verifyLinkCode);
router.post('/link/init', minecraftController.initWebLink);
router.get('/link/check', minecraftController.checkLinkStatus);

module.exports = router;
