const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { createInvite, listInvites, acceptInvite } = require('../controllers/inviteController');

router.post('/accept', acceptInvite);
router.use(protect, authorize('admin'));
router.get('/', listInvites);
router.post('/', createInvite);

module.exports = router;