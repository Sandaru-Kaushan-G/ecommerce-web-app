const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, NotFoundError } = require('../utils/errors');

exports.listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ validUntil: 1 });
  res.json(coupons);
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const code = req.body.code?.trim().toUpperCase();
  const { discountType, discountValue, minOrderValue = 0, validUntil } = req.body;
  if (!code || !['PERCENTAGE', 'FLAT'].includes(discountType)) {
    throw new ValidationError('Code and a valid discount type are required');
  }
  if (!Number.isFinite(Number(discountValue)) || Number(discountValue) <= 0) {
    throw new ValidationError('Discount value must be greater than zero');
  }
  if (discountType === 'PERCENTAGE' && Number(discountValue) > 100) {
    throw new ValidationError('Percentage discount cannot exceed 100');
  }
  const expiry = new Date(validUntil);
  if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) throw new ValidationError('Valid until must be a future date');
  const coupon = await Coupon.create({ code, discountType, discountValue: Number(discountValue), minOrderValue: Number(minOrderValue), validUntil: expiry });
  res.status(201).json(coupon);
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new NotFoundError('Coupon not found');
  res.status(204).send();
});