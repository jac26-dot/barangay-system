const express = require('express');
const router = express.Router();
const { getStats, getMonthlyData } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/stats', verifyToken, getStats);
router.get('/monthly', verifyToken, getMonthlyData);

module.exports = router;
