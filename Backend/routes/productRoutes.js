const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
  getProductsByCategory,
  placeBid
} = require('../controllers/productController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Get products by category
router.route('/category/:category').get(getProductsByCategory);

// Get products by farmer
router.route('/farmer/:id').get(getFarmerProducts);

// Add bid to product
router.route('/:id/bid').post(protect, placeBid);

// Main product routes
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('farmer'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('farmer'), updateProduct)
  .delete(protect, authorize('farmer'), deleteProduct);

module.exports = router; 