const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getMetrics = asyncHandler(async (req, res) => {
  const [revenueResult, totalOrders, pendingOrders, lowStockCount, totalCustomers, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['Pending', 'Processing'] } }),
    Product.countDocuments({ stock: { $lte: 5 } }),
    User.countDocuments({ role: 'customer' }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
  ]);

  res.json({
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    totalOrders,
    pendingOrders,
    lowStockCount,
    totalCustomers,
    recentOrders
  });
});