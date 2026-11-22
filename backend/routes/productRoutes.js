const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

// Public: Get all products
router.get('/', asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
}));

// Staff & Admin: Add product
router.post('/', protect, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));

router.patch('/:id', protect, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const updates = req.user.role === 'staff' ? { stock: req.body.stock } : req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) throw new NotFoundError('Product not found');
  res.json(product);
}));

router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new NotFoundError('Product not found');
  res.status(204).send();
}));

module.exports = router;