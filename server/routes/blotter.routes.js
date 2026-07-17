const express = require('express');
const router = express.Router();
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');
const Blotter = require('../models/Blotter');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await Blotter.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const blotter = await Blotter.findByPk(req.params.id);
    if (!blotter) return res.status(404).json({ success: false, message: 'Blotter not found.' });
    res.json({ success: true, data: blotter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', verifyToken, isStaffOrAdmin, async (req, res) => {
  try {
    const date = new Date();
    const caseNumber = `BLT-${date.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const blotter = await Blotter.create({ ...req.body, caseNumber });
    res.status(201).json({ success: true, message: 'Blotter recorded.', data: blotter });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', verifyToken, isStaffOrAdmin, async (req, res) => {
  try {
    const blotter = await Blotter.findByPk(req.params.id);
    if (!blotter) return res.status(404).json({ success: false, message: 'Blotter not found.' });
    await blotter.update(req.body);
    res.json({ success: true, message: 'Blotter updated.', data: blotter });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', verifyToken, isStaffOrAdmin, async (req, res) => {
  try {
    const blotter = await Blotter.findByPk(req.params.id);
    if (!blotter) return res.status(404).json({ success: false, message: 'Blotter not found.' });
    await blotter.destroy();
    res.json({ success: true, message: 'Blotter deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
