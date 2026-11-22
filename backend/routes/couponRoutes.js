const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { listCoupons, createCoupon, deleteCoupon } = require('../controllers/couponController');

router.use(protect, authorize('admin'));
router.get('/', listCoupons);
router.post('/', createCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;