const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { login, signup, forgotPassword, resetPassword, getMe, switchBranch } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts. Please try again later.' },
});

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.get('/me', protect, getMe);
router.post('/switch-branch', protect, switchBranch);

module.exports = router;
