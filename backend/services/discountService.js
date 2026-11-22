const Coupon = require('../models/Coupon');
const { ValidationError } = require('../utils/errors');

class DiscountStrategy {
	calculate() {
		throw new Error('DiscountStrategy.calculate must be implemented');
	}
}

class PercentageDiscountStrategy extends DiscountStrategy {
	calculate(subtotal, coupon) {
		return subtotal * (coupon.discountValue / 100);
	}
}

class FlatDiscountStrategy extends DiscountStrategy {
	calculate(subtotal, coupon) {
		return coupon.discountValue;
	}
}

const strategies = new Map([
	['PERCENTAGE', new PercentageDiscountStrategy()],
	['FLAT', new FlatDiscountStrategy()]
]);

class DiscountContext {
	constructor(strategy) {
		this.strategy = strategy;
	}

	calculate(subtotal, coupon) {
		if (subtotal < 0) throw new ValidationError('Subtotal cannot be negative');
		const discount = this.strategy.calculate(subtotal, coupon);
		return Math.min(subtotal, Math.max(0, discount));
	}
}

const applyDiscount = async (couponCode, subtotal, session) => {
	if (!couponCode) return 0;
	if (!Number.isFinite(subtotal) || subtotal < 0) {
		throw new ValidationError('Subtotal must be a non-negative number');
	}

	const query = Coupon.findOne({ code: couponCode.trim().toUpperCase() });
	if (session) query.session(session);
	const coupon = await query;
	if (!coupon) throw new ValidationError('Coupon code is invalid');
	if (coupon.validUntil <= new Date()) throw new ValidationError('Coupon has expired');
	if (subtotal < coupon.minOrderValue) {
		throw new ValidationError(`Minimum order value is ${coupon.minOrderValue}`);
	}

	const strategy = strategies.get(coupon.discountType);
	if (!strategy) throw new ValidationError('Coupon discount type is not supported');
	return new DiscountContext(strategy).calculate(subtotal, coupon);
};

module.exports = {
	DiscountContext,
	DiscountStrategy,
	PercentageDiscountStrategy,
	FlatDiscountStrategy,
	applyDiscount
};
