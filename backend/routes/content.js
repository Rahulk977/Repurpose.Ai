const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { auth } = require('../middleware/auth');

// All content routes require authentication
router.use(auth);

// Stats
router.get('/stats', contentController.getStats);

// History
router.get('/history', contentController.getHistory);

// Generate (with optional file upload)
router.post('/generate', contentController.uploadMiddleware, contentController.generateContent);

// Single content CRUD
router.get('/:id', contentController.getContent);
router.put('/:id', contentController.updateContentItem);
router.post('/:id/regenerate', contentController.regenerateItem);
router.delete('/:id', contentController.deleteContent);

module.exports = router;
