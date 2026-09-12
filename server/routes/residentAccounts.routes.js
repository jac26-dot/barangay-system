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

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: passwordHash,
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
// Returns only this resident's own profile + their own document
// requests — never anyone else's (prevents IDOR).
// ---------------------------------------------------------------
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
  if (payload.role !== 'resident') return res.status(403).json({ success: false, message: 'Not authorized.' });

  try {
    const resident = await Resident.findByPk(payload.residentId, {
      attributes: ['id', 'firstName', 'middleName', 'lastName', 'address', 'contactNumber', 'email'],
    });
    const requests = await Document.findAll({
      where: { residentId: payload.residentId },
      order: [['createdAt', 'DESC']],
      attributes: ['controlNumber', 'documentType', 'purpose', 'status', 'createdAt'],
    });
    res.json({ success: true, data: { resident, requests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load your profile.' });
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
