const bcrypt = require('bcryptjs');
const User = require('../models/User');

const bootstrapSuperAdmin = async () => {
  const name = process.env.SUPER_ADMIN_NAME?.trim();
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.warn('[Bootstrap] Super Admin variables are not fully configured; skipping bootstrap.');
    return;
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    isVerified: true
  });

  console.log('[Bootstrap] Super Admin created successfully.');
};

module.exports = bootstrapSuperAdmin;