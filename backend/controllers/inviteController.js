const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const StaffInvite = require('../models/StaffInvite');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ConflictError, ValidationError, NotFoundError } = require('../utils/errors');

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const serializeInvite = (invite) => ({
  id: invite._id,
  email: invite.email,
  role: invite.role,
  expiresAt: invite.expiresAt,
  used: invite.used,
  createdAt: invite.createdAt,
  status: invite.used ? 'Accepted' : (invite.expiresAt <= new Date() ? 'Expired' : 'Pending')
});

exports.createInvite = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const role = req.body.role || 'staff';
  if (!emailPattern.test(email || '')) throw new ValidationError('A valid email address is required');
  if (!['staff', 'admin'].includes(role)) throw new ValidationError('Invite role must be staff or admin');

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ConflictError('A user with this email already exists');

  const activeInvite = await StaffInvite.findOne({ email, used: false, expiresAt: { $gt: new Date() } });
  if (activeInvite) throw new ConflictError('An active invitation already exists for this email');

  const rawToken = crypto.randomBytes(32).toString('hex');
  const invite = await StaffInvite.create({
    email,
    role,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    invitedBy: req.user.id
  });
  const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${rawToken}`;

  console.log(`[Invite] Staff invitation generated for ${email}: ${inviteLink}`);
  res.status(201).json({ invite: serializeInvite(invite), inviteLink });
});

exports.listInvites = asyncHandler(async (req, res) => {
  const invites = await StaffInvite.find().sort({ createdAt: -1 }).limit(100);
  res.json(invites.map(serializeInvite));
});

exports.acceptInvite = asyncHandler(async (req, res) => {
  const { token, name, password } = req.body;
  if (!token || !name?.trim() || !password) {
    throw new ValidationError('Invitation token, name, and password are required');
  }
  if (password.length < 8) throw new ValidationError('Password must be at least 8 characters');

  const session = await mongoose.startSession();
  try {
    let sessionData;
    await session.withTransaction(async () => {
      const invite = await StaffInvite.findOne({ tokenHash: hashToken(token), used: false }).session(session);
      if (!invite) throw new NotFoundError('Invitation is invalid or has already been accepted');
      if (invite.expiresAt <= new Date()) throw new ValidationError('Invitation has expired');

      const existingUser = await User.findOne({ email: invite.email }).session(session);
      if (existingUser) throw new ConflictError('A user with this email already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await User.create([{
        name: name.trim(),
        email: invite.email,
        password: hashedPassword,
        role: invite.role,
        isVerified: true
      }], { session });

      invite.used = true;
      await invite.save({ session });
      const authToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      sessionData = { token: authToken, id: user._id.toString(), email: user.email, role: user.role, name: user.name };
    });
    res.status(201).json(sessionData);
  } finally {
    await session.endSession();
  }
});