const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoryStats,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// All product routes are protected
router.use(protect);

router.get('/categories/stats', getCategoryStats);
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
