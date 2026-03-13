const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../middleware/auth');

// Stripe webhook — must be BEFORE auth middleware (uses raw body)
router.post('/webhook', subscriptionController.handleWebhook);

// Protected routes
router.get('/status', auth, subscriptionController.getStatus);
router.post('/create', auth, subscriptionController.createCheckoutSession);
router.post('/portal', auth, subscriptionController.createPortalSession);

module.exports = router;
