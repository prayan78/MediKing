const express = require('express');
const router = express.Router();
const { login, getMe, switchBranch } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/switch-branch', protect, switchBranch);

module.exports = router;

