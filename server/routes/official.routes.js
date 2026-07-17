const express = require('express');
const router = express.Router();
const { verifyToken, isStaffOrAdmin, isAdmin } = require('../middleware/auth.middleware');
const Official = require('../models/Official');

router.get('/', verifyToken, async (req, res) => {
  try {
    const officials = await Official.findAll({ order: [['position', 'ASC']] });
    res.json({ success: true, data: officials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const official = await Official.findByPk(req.params.id);
    if (!official) return res.status(404).json({ success: false, message: 'Official not found.' });
    res.json({ success: true, data: official });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const official = await Official.create(req.body);
    res.status(201).json({ success: true, message: 'Official added.', data: official });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const official = await Official.findByPk(req.params.id);
    if (!official) return res.status(404).json({ success: false, message: 'Official not found.' });
    await official.update(req.body);
    res.json({ success: true, message: 'Official updated.', data: official });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const official = await Official.findByPk(req.params.id);
    if (!official) return res.status(404).json({ success: false, message: 'Official not found.' });
    await official.destroy();
    res.json({ success: true, message: 'Official deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
