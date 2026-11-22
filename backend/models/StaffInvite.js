const mongoose = require('mongoose');

const StaffInviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ['staff', 'admin'], default: 'staff' },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

StaffInviteSchema.index({ email: 1, used: 1 });

module.exports = mongoose.model('StaffInvite', StaffInviteSchema);