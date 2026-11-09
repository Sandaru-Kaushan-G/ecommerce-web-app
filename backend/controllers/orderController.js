const { executeCheckout } = require('../services/orderService');
const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const order = await executeCheckout(req.user.id, items, couponCode);
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};