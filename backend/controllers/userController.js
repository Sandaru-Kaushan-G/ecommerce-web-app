const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, 'name email role isActive createdAt').sort({ createdAt: -1 }).lean();
  res.json(users);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const allowedRoles = ['customer', 'staff', 'admin'];
  if (role !== undefined && !allowedRoles.includes(role)) throw new ValidationError('Invalid user role');
  if (isActive !== undefined && typeof isActive !== 'boolean') throw new ValidationError('isActive must be boolean');
  if (req.params.id === req.user.id && isActive === false) throw new ConflictError('You cannot deactivate your own account');

  const updates = {};
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;
  if (Object.keys(updates).length === 0) throw new ValidationError('Provide a role or isActive value');

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
    select: 'name email role isActive createdAt'
  });
  if (!user) throw new NotFoundError('User not found');
  res.json(user);
});