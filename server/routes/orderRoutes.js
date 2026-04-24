const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All order routes are protected
router.use(protect);

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').get(getOrder).put(updateOrderStatus).delete(deleteOrder);

module.exports = router;
