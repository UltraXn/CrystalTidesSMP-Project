import express from 'express';
import * as pollController from '../controllers/pollController.js';

const router = express.Router();

router.get('/', pollController.getPolls);
router.get('/active', pollController.getActivePoll);
router.post('/vote', pollController.vote);
router.post('/create', pollController.create);
router.post('/close/:id', pollController.close);

export default router;
