const express = require('express');
const router = express.Router();
const { getPatients, createPatient } = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPatients);
router.post('/', protect, createPatient);

module.exports = router;

