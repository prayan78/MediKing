const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('super_admin', 'hospital_admin', 'pharmacist', 'inventory_manager', 'accountant'));
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/', createCompany);
router.put('/:id', updateCompany);

module.exports = router;
