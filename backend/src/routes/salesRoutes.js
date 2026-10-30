const express = require('express');
const router = express.Router();
const { getSalesRegister } = require('../controllers/salesController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('super_admin', 'hospital_admin', 'pharmacist', 'accountant', 'receptionist'), getSalesRegister);

module.exports = router;
