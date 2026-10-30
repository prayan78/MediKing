const express = require('express');
const router = express.Router();
const {
  getNextVoucherNumber,
  createJournalVoucher,
  getAccountHeads,
  getStatement,
} = require('../controllers/journalVoucherController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('super_admin', 'hospital_admin', 'accountant'));
router.get('/next-number', getNextVoucherNumber);
router.get('/accounts', getAccountHeads);
router.get('/statement', getStatement);
router.post('/', createJournalVoucher);

module.exports = router;
