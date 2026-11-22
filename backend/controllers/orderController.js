const { executeCheckout } = require('../services/orderService');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, NotFoundError } = require('../utils/errors');

exports.createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { items, couponCode, shippingDetails } = req.body;
    let order;
    await session.withTransaction(async () => {
      order = await executeCheckout(req.user.id, items, couponCode, session, shippingDetails);
    });
    res.status(201).json({ success: true, order });
  } finally {
    await session.endSession();
  }
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowedStatuses.includes(status)) throw new ValidationError('Invalid order status');

  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!updated) throw new NotFoundError('Order not found');
  res.json({ success: true, updated });
});

exports.listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('items.product', 'title imageUrl');
  res.json(orders);
});