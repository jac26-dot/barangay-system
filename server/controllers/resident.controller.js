const { Op } = require('sequelize');
const Resident = require('../models/Resident');

// GET /api/residents
const getAll = async (req, res) => {
  try {
    const { search, status, gender, page = 1, limit = 10 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (search) {
      where[Op.or] = [
        { firstName:  { [Op.iLike]: `%${search}%` } },
        { lastName:   { [Op.iLike]: `%${search}%` } },
        { middleName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Resident.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC']],
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/residents/:id
const getOne = async (req, res) => {
  try {
    const resident = await Resident.findByPk(req.params.id);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });
    res.json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/residents
const create = async (req, res) => {
  try {
    const resident = await Resident.create(req.body);
    res.status(201).json({ success: true, message: 'Resident added successfully.', data: resident });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/residents/:id
const update = async (req, res) => {
  try {
    const resident = await Resident.findByPk(req.params.id);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });
    await resident.update(req.body);
    res.json({ success: true, message: 'Resident updated successfully.', data: resident });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/residents/:id
const remove = async (req, res) => {
  try {
    const resident = await Resident.findByPk(req.params.id);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });
    await resident.destroy();
    res.json({ success: true, message: 'Resident deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
