const Product = require('../models/Product');
const Order = require('../models/Order');
const { applyDiscount } = require('./discountService');

const executeCheckout = async (userId, items, couponCode) => {
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (product.stock < item.quantity) {
      throw new Error(`Not enough stock for: ${product.title}`);
    }

    subtotal += product.price * item.quantity;
    verifiedItems.push({
      product: product._id,
      quantity: item.quantity,
      unitPrice: product.price
    });
  }

  const discount = await applyDiscount(couponCode, subtotal);
  const finalTotal = Math.max(0, subtotal - discount);

  // Stock අඩු කිරීම
  for (const item of verifiedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  const order = await Order.create({
    user: userId,
    items: verifiedItems,
    subtotal,
    discountAmount: discount,
    total: finalTotal
  });

  return order;
};

module.exports = { executeCheckout };