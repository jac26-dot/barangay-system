// server/routes/residentAccounts.routes.js
//
// Uses your existing middleware/auth.middleware.js exports:
// verifyToken (checks JWT) and isAdmin (checks req.user.role === 'admin').

const express  = require('express');
const bcrypt   = require('bcryptjs'); // if your project uses plain 'bcrypt' instead, change this import
const jwt      = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Op }   = require('sequelize');
const router   = express.Router();

const User     = require('../models/User');
const Resident = require('../models/Resident');
const Document = require('../models/Document');

const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// ---------------------------------------------------------------
// Rate limiting — registration and login are both sensitive to
// brute-force / spam abuse.
// ---------------------------------------------------------------
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

function clean(str, max = 255) {
  return String(str || '').trim().slice(0, max);
}
function normalize(str) {
  return clean(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ---------------------------------------------------------------
// Shared auth helper for the resident-only /me routes below.
// Mirrors the same manual JWT check already used by GET /me, so
// this is not a behavior change — just made reusable.
// ---------------------------------------------------------------
function authenticateResident(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'resident') return res.status(403).json({ success: false, message: 'Not authorized.' });
    req.residentPayload = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
}

// ---------------------------------------------------------------
// POST /api/resident-accounts/register
//
// Flow: Register → duplicate-check against Resident registry →
// link to existing resident OR create a new (Pending) one →
// create a Pending user account → admin must approve before login
// works.
// ---------------------------------------------------------------
router.post('/register', registerLimiter, async (req, res) => {
  const firstName = clean(req.body.firstName);
  const middleName = clean(req.body.middleName);
  const lastName  = clean(req.body.lastName);
  const birthDate = req.body.birthDate;
  const gender    = clean(req.body.gender) || 'Male';
  const civilStatus = clean(req.body.civilStatus) || 'Single';
  const address   = clean(req.body.address, 500);
  const contactNumber = clean(req.body.contactNumber, 20);
  const email     = clean(req.body.email).toLowerCase();
  const password  = req.body.password || '';
  const confirmPassword = req.body.confirmPassword || '';

  const errors = [];
  if (!firstName) errors.push('First name is required.');
  if (!lastName) errors.push('Last name is required.');
  if (!birthDate || isNaN(Date.parse(birthDate))) errors.push('A valid date of birth is required.');
  if (!address) errors.push('Address is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email address is required.');
  if (!contactNumber || !/^(09\d{9}|\+639\d{9})$/.test(contactNumber.replace(/[\s-]/g, ''))) {
    errors.push('A valid PH mobile number is required (09XXXXXXXXX).');
  }
  if (password.length < 8) errors.push('Password must be at least 8 characters.');
  if (password !== confirmPassword) errors.push('Passwords do not match.');
  if (!req.body.agreeTerms) errors.push('You must agree to the Terms and Conditions and Privacy Notice.');

  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Duplicate detection against the resident registry — same
    // matching approach as the verification endpoint: name + birth
    // date is the primary key, address as a tiebreaker.
    const candidates = await Resident.findAll({
      where: {
        firstName: { [Op.iLike]: firstName },
        lastName: { [Op.iLike]: lastName },
        birthDate,
      },
      limit: 5,
    });

    let resident = null;
    let linkedExisting = false;

    if (candidates.length === 1) {
      resident = candidates[0];
      linkedExisting = true;
    } else if (candidates.length > 1) {
      const normAddr = normalize(address);
      resident = candidates.find(c => normAddr && normalize(c.address).includes(normAddr))
              || candidates.find(c => normAddr && normalize(normAddr).includes(normalize(c.address)));
      if (resident) linkedExisting = true;
    }

    if (!resident) {
      resident = await Resident.create({
        firstName, middleName, lastName, birthDate, gender, civilStatus,
        address, contactNumber, email, status: 'Active',
      });
    }

    // NOTE: do not hash the password here — the User model's
    // beforeCreate hook already hashes it automatically. Hashing it
    // twice would make login impossible (bcrypt.compare would never
    // match a hash-of-a-hash against the plain password).
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password, // plain password — model hook hashes it
      role: 'resident',
      isActive: false,           // cannot log in until approved
      accountStatus: 'Pending',
      residentId: resident.id,
    });

    res.status(201).json({
      success: true,
      data: {
        message: linkedExisting
          ? 'Account created and linked to your existing resident record. An admin will review and approve your account shortly.'
          : 'Account created. An admin will review and approve your account shortly.',
        userId: user.id,
      },
    });
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      originalMessage: error.original?.message,
      code: error.original?.code,
      detail: error.original?.detail,
      name: error.name,
    });
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// ---------------------------------------------------------------
// POST /api/resident-accounts/login
// ---------------------------------------------------------------
router.post('/login', loginLimiter, async (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email, role: 'resident' } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'Pending') {
      return res.status(403).json({ success: false, message: 'Your account is still pending admin approval.' });
    }
    if (user.accountStatus === 'Rejected') {
      return res.status(403).json({ success: false, message: 'Your account application was not approved. Please contact the barangay office.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is not active. Please contact the barangay office.' });
    }

    const token = jwt.sign(
      { userId: user.id, residentId: user.residentId, role: 'resident' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token, userId: user.id, residentId: user.residentId, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// ---------------------------------------------------------------
// GET /api/resident-accounts/me   (resident-only, requires own token)
// Returns this resident's own profile, their own document requests,
// and their account info (photo, status, created date) — never
// anyone else's (prevents IDOR).
// ---------------------------------------------------------------
router.get('/me', authenticateResident, async (req, res) => {
  const { residentPayload: payload } = req;

  try {
    const resident = await Resident.findByPk(payload.residentId, {
      attributes: ['id', 'firstName', 'middleName', 'lastName', 'address', 'contactNumber', 'email', 'status', 'birthDate', 'gender', 'civilStatus'],
    });
    const requests = await Document.findAll({
      where: { residentId: payload.residentId },
      order: [['createdAt', 'DESC']],
      attributes: ['controlNumber', 'documentType', 'purpose', 'status', 'createdAt', 'fee', 'remarks'],
    });
    const user = await User.findByPk(payload.userId, {
      attributes: ['photoUrl', 'accountStatus', 'createdAt'],
    });

    res.json({
      success: true,
      data: {
        resident,
        requests,
        account: user ? { photoUrl: user.photoUrl, accountStatus: user.accountStatus, createdAt: user.createdAt } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load your profile.' });
  }
});

// ---------------------------------------------------------------
// PATCH /api/resident-accounts/me   (resident-only)
// Lets a resident update the limited set of fields the system is
// designed to let them self-edit: contact number and address.
// Name/email changes require admin verification — not exposed here.
// ---------------------------------------------------------------
router.patch('/me', authenticateResident, async (req, res) => {
  const { residentPayload: payload } = req;
  const contactNumber = clean(req.body.contactNumber, 20);
  const address = clean(req.body.address, 500);

  if (contactNumber && !/^(09\d{9}|\+639\d{9})$/.test(contactNumber.replace(/[\s-]/g, ''))) {
    return res.status(400).json({ success: false, message: 'A valid PH mobile number is required (09XXXXXXXXX).' });
  }

  try {
    const resident = await Resident.findByPk(payload.residentId);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident record not found.' });

    if (contactNumber) resident.contactNumber = contactNumber;
    if (address) resident.address = address;
    await resident.save();

    res.json({ success: true, data: { message: 'Profile updated.' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update your profile.' });
  }
});

// ---------------------------------------------------------------
// PATCH /api/resident-accounts/me/photo   (resident-only)
// Stores the resident's own profile/ID photo as a base64 data URI.
// Size/type validation happens on the frontend too, but is
// re-checked here since the frontend check can be bypassed.
// ---------------------------------------------------------------
router.patch('/me/photo', authenticateResident, async (req, res) => {
  const { residentPayload: payload } = req;
  const { photo } = req.body;

  if (!photo || typeof photo !== 'string' || !photo.startsWith('data:image/')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid image.' });
  }
  // Rough size check: base64 is ~4/3 the size of the original bytes.
  // 3MB original → ~4MB of base64 text.
  if (photo.length > 4.2 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'Image is too large. Please choose a photo under 3MB.' });
  }
  const allowedPrefixes = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp'];
  if (!allowedPrefixes.some(p => photo.startsWith(p))) {
    return res.status(400).json({ success: false, message: 'Please upload a JPG, PNG, or WEBP image.' });
  }

  try {
    const user = await User.findByPk(payload.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    user.photoUrl = photo;
    await user.save();
    res.json({ success: true, data: { message: 'Photo updated.' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not save your photo.' });
  }
});

// ---------------------------------------------------------------
// DELETE /api/resident-accounts/me/photo   (resident-only)
// ---------------------------------------------------------------
router.delete('/me/photo', authenticateResident, async (req, res) => {
  const { residentPayload: payload } = req;
  try {
    const user = await User.findByPk(payload.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    user.photoUrl = null;
    await user.save();
    res.json({ success: true, data: { message: 'Photo removed.' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not remove your photo.' });
  }
});

// ---------------------------------------------------------------
// POST /api/resident-accounts/me/documents   (resident-only)
//
// Lets an already-logged-in, admin-approved resident submit a
// document request directly — no separate residency verification
// needed, since admin approval (Resident Account Registrations)
// already established who they are. This mirrors the validation
// and control-number logic in public.routes.js's POST
// /documents/public, but is scoped to the authenticated resident's
// own residentId only (never a residentId supplied by the client),
// so there is no way to submit a request as someone else.
// ---------------------------------------------------------------
const DOCUMENT_TYPES = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency',
  'Business Clearance',
  'Good Moral Certificate',
];

function generateControlNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BRY-${year}-${rand}`;
}

router.post('/me/documents', authenticateResident, async (req, res) => {
  const { residentPayload: payload } = req;
  const documentType = clean(req.body.documentType);
  const purpose = clean(req.body.purpose, 300);

  if (!DOCUMENT_TYPES.includes(documentType)) {
    return res.status(400).json({ success: false, message: 'Invalid document type.' });
  }
  if (!purpose) {
    return res.status(400).json({ success: false, message: 'Purpose is required.' });
  }

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const dup = await Document.findOne({
      where: {
        residentId: payload.residentId,
        documentType,
        purpose,
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
      residentId: payload.residentId,
      documentType,
      purpose,
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

// =================================================================
// ADMIN ROUTES — require existing admin auth middleware.
// Mounted separately below at /api/admin/resident-accounts
// =================================================================
const adminRouter = express.Router();

// GET /api/admin/resident-accounts?status=Pending
adminRouter.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    const where = status ? { role: 'resident', accountStatus: status } : { role: 'resident' };
    const accounts = await User.findAll({
      where,
      include: [{ model: Resident, attributes: ['firstName', 'middleName', 'lastName', 'address', 'contactNumber'] }],
      attributes: ['id', 'name', 'email', 'accountStatus', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load registrations.' });
  }
});

// POST /api/admin/resident-accounts/:id/approve
adminRouter.post('/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || user.role !== 'resident') return res.status(404).json({ success: false, message: 'Account not found.' });
    user.accountStatus = 'Approved';
    user.isActive = true;
    await user.save();
    res.json({ success: true, data: { message: 'Account approved.' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not approve account.' });
  }
});

// POST /api/admin/resident-accounts/:id/reject
adminRouter.post('/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || user.role !== 'resident') return res.status(404).json({ success: false, message: 'Account not found.' });
    user.accountStatus = 'Rejected';
    user.isActive = false;
    await user.save();
    res.json({ success: true, data: { message: 'Account rejected.' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not reject account.' });
  }
});

module.exports = { router, adminRouter };
