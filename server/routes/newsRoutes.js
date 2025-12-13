const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Define routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.get('/:id/comments', newsController.getCommentsByNewsId);
router.post('/:id/comments', newsController.createComment);
router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;
