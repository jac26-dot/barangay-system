const express  = require('express');
const router   = express.Router();
const Resident = require('../models/Resident');
const Document = require('../models/Document');

const generateControlNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BRY-${year}-${rand}`;
};

// POST /api/residents/public
router.post('/residents/public', async (req, res) => {
  try {
    const resident = await Resident.create(req.body);
    res.status(201).json({ success: true, data: resident });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/documents/public
router.post('/documents/public', async (req, res) => {
  try {
    const controlNumber = generateControlNumber();
    const doc  = await Document.create({ ...req.body, controlNumber, status:'Pending' });
    const full = await Document.findByPk(doc.id, {
      include: [{ model: Resident, attributes: ['firstName','middleName','lastName','address'] }],
    });
    res.status(201).json({ success: true, data: full });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/documents/track/:controlNumber
router.get('/documents/track/:controlNumber', async (req, res) => {
  try {
    const doc = await Document.findOne({
      where: { controlNumber: req.params.controlNumber },
      include: [{ model: Resident, attributes: ['firstName','middleName','lastName','address'] }],
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
