const Product = require('../models/Product');
const Order = require('../models/Order');
const { applyDiscount } = require('./discountService');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

const executeCheckout = async (userId, items, couponCode, session, shippingDetails) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('At least one item is required to place an order');
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new ValidationError('Item quantities must be positive whole numbers');
    }
    const product = await Product.findById(item.productId).session(session);
    if (!product) throw new NotFoundError(`Product not found: ${item.productId}`);

    subtotal += product.price * item.quantity;
    verifiedItems.push({
      product: product._id,
      quantity: item.quantity,
      unitPrice: product.price
    });
  }

  const discount = await applyDiscount(couponCode, subtotal, session);
  const finalTotal = Math.max(0, subtotal - discount);

  for (const item of verifiedItems) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true, session }
    );
    if (!updatedProduct) throw new ConflictError(`Not enough stock for product ${item.product}`);
  }

  const [order] = await Order.create([{
    user: userId,
    shippingDetails,
    items: verifiedItems,
    subtotal,
    discountAmount: discount,
    total: finalTotal
  }], { session });

  return order;
};

module.exports = { executeCheckout };