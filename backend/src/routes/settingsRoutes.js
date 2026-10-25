const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, getSettings);
router.put('/', protect, authorize('super_admin', 'hospital_admin'), updateSettings);

module.exports = router;

