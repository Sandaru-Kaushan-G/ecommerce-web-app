const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { createOrder, updateOrderStatus } = require('../controllers/orderController');

// Customer පමණක් Checkout කරයි
router.post('/checkout', protect, authorize('customer'), createOrder);

// Staff සහ Admin හට Order Status Update කළ හැක
router.patch('/:id/status', protect, authorize('staff', 'admin'), updateOrderStatus);

module.exports = router;