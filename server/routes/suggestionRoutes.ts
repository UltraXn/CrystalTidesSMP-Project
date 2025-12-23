import express from 'express';
import * as suggestionController from '../controllers/suggestionController.js';

const router = express.Router();

router.get('/', suggestionController.getSuggestions);
router.post('/', suggestionController.createSuggestion);
router.delete('/:id', suggestionController.deleteSuggestion);

export default router;
