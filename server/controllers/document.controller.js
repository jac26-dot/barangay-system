const { Op } = require('sequelize');
const Document = require('../models/Document');
const Resident = require('../models/Resident');

const generateControlNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BRY-${year}-${rand}`;
};

// GET /api/documents
const getAll = async (req, res) => {
  try {
    const { status, documentType, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (documentType) where.documentType = documentType;

    const offset = (page - 1) * limit;
    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [{ model: Resident, attributes: ['firstName', 'middleName', 'lastName', 'address'] }],
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
};

// GET /api/documents/:id
const getOne = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id, {
      include: [{ model: Resident }],
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/documents
const create = async (req, res) => {
  try {
    const controlNumber = generateControlNumber();
    const doc = await Document.create({ ...req.body, controlNumber });
    res.status(201).json({ success: true, message: 'Document request created.', data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/documents/:id
const update = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    await doc.update(req.body);
    res.json({ success: true, message: 'Document updated.', data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/documents/:id
const remove = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    await doc.destroy();
    res.json({ success: true, message: 'Document deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
