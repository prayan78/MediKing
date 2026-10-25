const express = require('express');
const router = express.Router();
const {
  getNextMrn,
  getPurchases,
  getPurchaseById,
  createPurchase,
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

router.get('/next-mrn', protect, getNextMrn);
router.get('/', protect, getPurchases);
router.get('/:id', protect, getPurchaseById);
router.post('/', protect, createPurchase);

module.exports = router;

