const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { getMetrics } = require('../controllers/adminController');
const { listUsers, updateUserRole } = require('../controllers/userController');

router.use(protect, authorize('admin'));
router.get('/metrics', getMetrics);
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;