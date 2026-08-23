const express  = require('express');
const rateLimit = require('express-rate-limit');
const { Op }   = require('sequelize');
const router   = express.Router();
const Resident = require('../models/Resident');
const Document = require('../models/Document');

// ---------------------------------------------------------------
// Rate limiting — public endpoints are open to anyone, so they
// need protection against spam / scripted abuse.
// ---------------------------------------------------------------
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,                   // 8 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this device. Please try again later.' },
});

const lookupLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in a few minutes.' },
});

const generateControlNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BRY-${year}-${rand}`;
};

// ---------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------
const DOCUMENT_TYPES = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency',
  'Business Clearance',
  'Good Moral Certificate',
];
const GENDERS = ['Male', 'Female'];
const CIVIL_STATUS = ['Single', 'Married', 'Widowed', 'Separated'];

function clean(str, max = 255) {
  return String(str || '').trim().slice(0, max);
}

function validateResidentInput(body) {
  const errors = [];
  const firstName = clean(body.firstName);
  const lastName  = clean(body.lastName);
  const address   = clean(body.address, 500);
  const gender    = clean(body.gender);
  const civilStatus = clean(body.civilStatus);
  const email     = clean(body.email);
  const contactNumber = clean(body.contactNumber, 20);

  if (!firstName) errors.push('First name is required.');
  if (!lastName)  errors.push('Last name is required.');
  if (!address)   errors.push('Address is required.');
  if (gender && !GENDERS.includes(gender)) errors.push('Invalid gender.');
  if (civilStatus && !CIVIL_STATUS.includes(civilStatus)) errors.push('Invalid civil status.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email address.');
  if (contactNumber && !/^(09\d{9}|\+639\d{9})$/.test(contactNumber.replace(/[\s-]/g, ''))) {
    errors.push('Invalid contact number. Use format 09XXXXXXXXX.');
  }
  if (body.birthDate && isNaN(Date.parse(body.birthDate))) errors.push('Invalid date of birth.');
  if (body.birthDate && new Date(body.birthDate) > new Date()) errors.push('Date of birth cannot be in the future.');

  return {
    errors,
    // Only pass through fields we explicitly allow — never spread
    // req.body directly into a model, or a caller could set
    // arbitrary fields (e.g. isVoter, isIndigent, id).
    data: {
      firstName, middleName: clean(body.middleName), lastName,
      birthDate: body.birthDate || null,
      gender: gender || 'Male',
      civilStatus: civilStatus || 'Single',
      address,
      contactNumber,
      email,
      status: 'Active',
    },
  };
}

function validateDocumentInput(body) {
  const errors = [];
  const documentType = clean(body.documentType);
  const purpose = clean(body.purpose, 300);
  const residentId = parseInt(body.residentId, 10);

  if (!residentId || isNaN(residentId)) errors.push('A valid resident is required.');
  if (!DOCUMENT_TYPES.includes(documentType)) errors.push('Invalid document type.');
  if (!purpose) errors.push('Purpose is required.');

  return { errors, data: { residentId, documentType, purpose } };
}

// ---------------------------------------------------------------
// GET /api/residents/search-public
// Public, minimal-field resident lookup so the portal can check
// "does this person already exist?" without needing admin auth
// and without exposing the full resident directory.
// Only returns id + name — no address, contact info, etc.
// ---------------------------------------------------------------
router.get('/residents/search-public', lookupLimiter, async (req, res) => {
  try {
    const firstName = clean(req.query.firstName);
    const lastName  = clean(req.query.lastName);
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'firstName and lastName are required.' });
    }

    const matches = await Resident.findAll({
      where: {
        firstName: { [Op.iLike]: firstName },
        lastName:  { [Op.iLike]: lastName },
      },
      attributes: ['id', 'firstName', 'lastName'],
      limit: 5,
    });

    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed. Please try again.' });
  }
});

// ---------------------------------------------------------------
// POST /api/residents/public
// Creates a resident record from public input. Validated and
// field-limited — never trusts the raw request body directly.
// ---------------------------------------------------------------
router.post('/residents/public', submitLimiter, async (req, res) => {
  const { errors, data } = validateResidentInput(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }
  try {
    const resident = await Resident.create(data);
    res.status(201).json({ success: true, data: { id: resident.id, firstName: resident.firstName, lastName: resident.lastName } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not save resident information. Please check your details and try again.' });
  }
});

// ---------------------------------------------------------------
// POST /api/documents/public
// Validated, rate-limited, and guards against accidental
// duplicate submissions (e.g. double-clicking Submit).
// ---------------------------------------------------------------
router.post('/documents/public', submitLimiter, async (req, res) => {
  const { errors, data } = validateDocumentInput(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  try {
    // Duplicate guard: same resident + same document type + same
    // purpose, still Pending, submitted in the last 10 minutes.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const dup = await Document.findOne({
      where: {
        residentId: data.residentId,
        documentType: data.documentType,
        purpose: data.purpose,
        status: 'Pending',
        createdAt: { [Op.gte]: tenMinutesAgo },
      },
    });
    if (dup) {
      return res.status(200).json({
        success: true,
        data: { controlNumber: dup.controlNumber, documentType: dup.documentType, status: dup.status },
        message: 'You already submitted this request a moment ago.',
      });
    }

    const controlNumber = generateControlNumber();
    const doc = await Document.create({
      residentId: data.residentId,
      documentType: data.documentType,
      purpose: data.purpose,
      controlNumber,
      status: 'Pending',
      fee: 0,
    });

    res.status(201).json({
      success: true,
      data: { controlNumber: doc.controlNumber, documentType: doc.documentType, status: doc.status },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not submit your request. Please try again.' });
  }
});

// ---------------------------------------------------------------
// GET /api/documents/track/:controlNumber
// Public tracking — deliberately returns ONLY non-sensitive
// fields. Never expose address, contact number, or email here,
// since a control number is guessable/shareable.
// ---------------------------------------------------------------
router.get('/documents/track/:controlNumber', lookupLimiter, async (req, res) => {
  try {
    const controlNumber = clean(req.params.controlNumber, 50);
    const doc = await Document.findOne({
      where: { controlNumber },
      include: [{ model: Resident, attributes: ['firstName', 'lastName'] }],
      attributes: ['controlNumber', 'documentType', 'purpose', 'status', 'fee', 'remarks', 'createdAt'],
    });
    if (!doc) return res.status(404).json({ success: false, message: 'No request found with that control number.' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lookup failed. Please try again.' });
  }
});

module.exports = router;
