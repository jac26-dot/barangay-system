const express = require('express');
const router = express.Router();
const { getStats, getMonthlyData } = require('../controllers/dashboard.controller');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');

router.get('/stats',   verifyToken, isStaffOrAdmin, getStats);
router.get('/monthly', verifyToken, isStaffOrAdmin, getMonthlyData);

module.exports = router;
