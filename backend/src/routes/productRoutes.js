const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleStatus,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.patch('/:id/toggle-status', protect, toggleStatus);
router.delete('/:id', protect, deleteProduct);

module.exports = router;

