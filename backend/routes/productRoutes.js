const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// Public: Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Staff & Admin: Add product
router.post('/', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;