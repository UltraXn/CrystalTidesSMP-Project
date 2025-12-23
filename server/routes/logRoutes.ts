import express from 'express';
import * as logsController from '../controllers/logsController.js'; // CoreProtect Logs
import * as logController from '../controllers/logController.js'; // Internal Logs

const router = express.Router();

router.get('/', logController.getLogs);
router.post('/', logController.createLog);
router.get('/commands', logsController.getCommandLogs);

export default router;
