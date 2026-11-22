const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { UnauthorizedError, ValidationError, ConflictError } = require('../utils/errors');

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new ValidationError('Name, email, and password are required');
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) throw new ConflictError('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    // ආරම්භයේදී role එකක් නොදුන්නොත් default 'customer' වේ
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer'
    });

    res.status(201).json({ message: 'User created successfully', userId: user._id });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, id: user._id.toString(), email: user.email, role: user.role, name: user.name });
});