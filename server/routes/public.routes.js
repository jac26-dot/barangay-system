const express   = require('express');
const rateLimit = require('express-rate-limit');
const jwt       = require('jsonwebtoken');
const { Op }    = require('sequelize');
const router    = express.Router();
const Resident        = require('../models/Resident');
const Document        = require('../models/Document');
const VerificationLog = require('../models/VerificationLog');

// ---------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
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

// Deliberately strict — this endpoint checks real people's PII against
// the resident registry, so it must not be usable for brute-force
// guessing of who is/isn't a resident.
const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts. Please try again later or contact the barangay office.' },
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

function normalize(str) {
  return clean(str).toLowerCase().replace(/[^a-z0-9]/g, '');
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
// POST /api/residents/verify
//
// Checks submitted identity info against the official Resident
// registry, server-side. Never returns the resident list; only
// returns a yes/no result plus a short-lived signed token on
// success (used later to authorize a document request as that
// specific resident).
//
// Matching rule: first name + last name + birth date must match a
// Resident record (name alone is never sufficient). Address is used
// as a secondary confirmation signal when multiple residents share
// the same name + birth date.
// ---------------------------------------------------------------
router.post('/residents/verify', verifyLimiter, async (req, res) => {
  const firstName = clean(req.body.firstName);
  const lastName  = clean(req.body.lastName);
  const birthDate = req.body.birthDate;
  const address   = clean(req.body.address, 500);
  const contactNumber = clean(req.body.contactNumber, 20);
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

  const logAttempt = (status, matchedResidentId = null) =>
    VerificationLog.create({
      submittedFirstName: firstName,
      submittedLastName: lastName,
      submittedBirthDate: birthDate || null,
      submittedAddress: address,
      submittedContactNumber: contactNumber,
      matchedResidentId,
      status,
      ipAddress: ip,
    }).catch(() => {}); // never let logging failures break the response

  if (!firstName || !lastName || !birthDate) {
    return res.status(400).json({ success: false, message: 'First name, last name, and date of birth are required.' });
  }

  try {
    const candidates = await Resident.findAll({
      where: {
        firstName: { [Op.iLike]: firstName },
        lastName: { [Op.iLike]: lastName },
        birthDate,
      },
      limit: 5,
    });

    let match = null;
    if (candidates.length === 1) {
      match = candidates[0];
    } else if (candidates.length > 1) {
      const normAddr = normalize(address);
      match = candidates.find(c => normAddr && normalize(c.address).includes(normAddr))
           || candidates.find(c => normAddr && normalize(normAddr).includes(normalize(c.address)));
    }

    if (!match) {
      await logAttempt('Failed');
      return res.json({
        success: true,
        data: {
          verified: false,
          message: 'We could not verify your residency using the information provided.',
        },
      });
    }

    await logAttempt('Verified', match.id);

    const token = jwt.sign(
      { residentId: match.id, purpose: 'document-request-verification' },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    return res.json({
      success: true,
      data: {
        verified: true,
        token,
        residentId: match.id,
        firstName: match.firstName,
        lastName: match.lastName,
        middleName: match.middleName,
        address: match.address,
      },
    });
  } catch (error) {
    await logAttempt('Failed');
    return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

// ---------------------------------------------------------------
// GET /api/residents/search-public
// Kept for backward compatibility; the RequestForm now relies on
// the verify step above instead.
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
// Kept for edge cases, validated and rate-limited as before.
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
//
// Now REQUIRES a valid verification token (from /residents/verify).
// The token's residentId must match the residentId being submitted
// for — this is what prevents someone from verifying as themselves
// and then submitting a request claiming to be a different resident.
// ---------------------------------------------------------------
router.post('/documents/public', submitLimiter, async (req, res) => {
  const { errors, data } = validateDocumentInput(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  const { verificationToken } = req.body;
  if (!verificationToken) {
    return res.status(401).json({ success: false, message: 'Residency verification is required before submitting a request.' });
  }

  let payload;
  try {
    payload = jwt.verify(verificationToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Your verification has expired. Please verify your residency again.' });
  }

  if (payload.purpose !== 'document-request-verification' || payload.residentId !== data.residentId) {
    return res.status(403).json({ success: false, message: 'Verification does not match the selected resident.' });
  }

  try {
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
      verificationStatus: 'Verified',
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
