const express = require('express');
const router = express.Router();
const {
  getWeeklyRoster,
  saveWeeklyRoster,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/weekly-roster', protect, authorize('super_admin', 'hospital_admin', 'nurse', 'receptionist'), getWeeklyRoster);
router.put('/weekly-roster', protect, authorize('super_admin', 'hospital_admin', 'nurse'), saveWeeklyRoster);

module.exports = router;
