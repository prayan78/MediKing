const express = require('express');
const router = express.Router();
const { getSalesRegister } = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSalesRegister);

module.exports = router;
