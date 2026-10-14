const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }

  // Only admin/staff tokens carry an "id". Verification and resident
  // tokens must never be accepted here.
  if (!decoded.id) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  try {
    // Check the account on every request, so a deactivated user or a
    // changed role takes effect immediately instead of when the token expires.
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'name', 'role', 'isActive'] });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'This account is no longer active.' });
    }
    req.user = { ...decoded, role: user.role, name: user.name };
    next();
  } catch (error) {
    next(error);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

const isStaffOrAdmin = (req, res, next) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isStaffOrAdmin };
