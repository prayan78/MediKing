const express = require('express');
const router = express.Router();
const { getBranches, createBranch } = require('../controllers/branchController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, getBranches);
router.post('/', protect, authorize('super_admin', 'hospital_admin'), createBranch);

module.exports = router;

