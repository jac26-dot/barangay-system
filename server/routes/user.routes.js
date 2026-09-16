const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');
const User = require('../models/User');

// The "User Accounts" page is for admin/staff/viewer system users
// only — Resident Portal accounts are managed separately under
// Residents / Resident Registrations, not here.
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: { [Op.ne]: 'resident' } },
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    if (req.body.role === 'resident') {
      return res.status(400).json({ success: false, message: 'Resident accounts are created through the Resident Portal, not here.' });
    }
    const exists = await User.findOne({ where: { email: req.body.email } });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use.' });
    const user = await User.create(req.body);
    const { password, ...userData } = user.toJSON();
    res.status(201).json({ success: true, message: 'User created.', data: userData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'resident') {
      return res.status(400).json({ success: false, message: 'Resident accounts are managed through Resident Registrations, not here.' });
    }
    await user.update(req.body);
    const { password, ...userData } = user.toJSON();
    res.json({ success: true, message: 'User updated.', data: userData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'resident') {
      return res.status(400).json({ success: false, message: 'Resident accounts are managed through Resident Registrations, not here.' });
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
