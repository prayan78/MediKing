const express = require('express');
const router = express.Router();
const {
  getWeeklyRoster,
  saveWeeklyRoster,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.get('/weekly-roster', protect, getWeeklyRoster);
router.put('/weekly-roster', protect, saveWeeklyRoster);

module.exports = router;
