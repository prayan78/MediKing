const express = require('express');
const router = express.Router();
const {
  getGenericMedicines,
  createGenericMedicine,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleStatus,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('super_admin', 'hospital_admin', 'pharmacist', 'inventory_manager'));
router.get('/generic-medicines', getGenericMedicines);
router.post('/generic-medicines', createGenericMedicine);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/toggle-status', toggleStatus);
router.delete('/:id', deleteProduct);

module.exports = router;
