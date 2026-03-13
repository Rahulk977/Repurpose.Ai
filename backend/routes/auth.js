const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);
router.get('/me', auth, authController.getMe);
router.put('/settings', auth, authController.updateSettings);
router.put('/password', auth, authController.changePassword);

module.exports = router;
