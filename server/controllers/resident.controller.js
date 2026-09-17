const { Op } = require('sequelize');
const Resident = require('../models/Resident');
const User = require('../models/User');

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
      include: [{ model: User, as: 'account', attributes: ['photoUrl'], required: false }],
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
    const resident = await Resident.findByPk(req.params.id, {
      include: [{ model: User, as: 'account', attributes: ['photoUrl'], required: false }],
    });
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
// DELETE /api/residents/:id?force=true  — permanently deletes the
// resident AND their linked document requests / account. Only
// meant to be used on an already-archived resident (e.g. duplicate
// or test data). Irreversible.
const remove = async (req, res) => {
  const Document = require('../models/Document');
  try {
    const resident = await Resident.findByPk(req.params.id);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });

    if (req.query.force === 'true') {
      const VerificationLog = require('../models/VerificationLog');
      try {
        // Keep the audit trail itself, just detach it from the
        // resident being permanently removed.
        await VerificationLog.update({ matchedResidentId: null }, { where: { matchedResidentId: resident.id } });
        await Document.destroy({ where: { residentId: resident.id } });
        await User.destroy({ where: { residentId: resident.id } });
        await resident.destroy();
        return res.json({
          success: true,
          message: 'Resident and all related records were permanently deleted.',
          data: { archived: false, forced: true },
        });
      } catch (forceError) {
        if (forceError.name === 'SequelizeForeignKeyConstraintError') {
          return res.status(409).json({
            success: false,
            message: 'This resident still has other related records that must be removed first (' + (forceError.parent?.constraint || 'unknown reference') + ').',
          });
        }
        throw forceError;
      }
    }

    try {
      await resident.destroy();
      return res.json({ success: true, message: 'Resident deleted successfully.', data: { archived: false } });
    } catch (fkError) {
      // Resident has related document requests and/or a linked
      // account that must be retained for records — a hard delete
      // would violate the foreign-key constraint on those tables.
      // Archive instead of failing silently.
      if (fkError.name === 'SequelizeForeignKeyConstraintError') {
        resident.status = 'Archived';
        await resident.save();
        return res.json({
          success: true,
          message: 'This resident has related document requests or a linked account on file, so the record was archived instead of permanently deleted.',
          data: { archived: true },
        });
      }
      throw fkError;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Could not delete resident.' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
