const express = require('express');
const router = express.Router();
const { getPatients, createPatient } = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('super_admin', 'hospital_admin', 'doctor', 'nurse', 'receptionist', 'lab_tech', 'pharmacist'), getPatients);
router.post('/', protect, authorize('super_admin', 'hospital_admin', 'doctor', 'nurse', 'receptionist'), createPatient);

module.exports = router;
