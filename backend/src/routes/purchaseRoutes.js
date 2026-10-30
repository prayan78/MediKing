const express = require('express');
const router = express.Router();
const {
  getNextMrn,
  getPurchases,
  getPurchaseById,
  createPurchase,
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('super_admin', 'hospital_admin', 'pharmacist', 'inventory_manager', 'accountant'));
router.get('/next-mrn', getNextMrn);
router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.post('/', createPurchase);

module.exports = router;
