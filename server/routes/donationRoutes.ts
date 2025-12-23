import express from 'express';
import * as donationController from '../controllers/donationController.js';

const router = express.Router();

router.get('/', donationController.getDonations);
router.post('/', donationController.createDonation);
router.put('/:id', donationController.updateDonation);
router.delete('/:id', donationController.deleteDonation);
router.get('/stats', donationController.getStats);

export default router;
