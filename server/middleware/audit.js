const AuditLog = require('../models/AuditLog');

// Reads of these areas are logged as well as writes, because looking at
// a resident's record is itself an access to personal data.
const SENSITIVE_AREAS = /^\/api\/(residents|documents|blotter|users|officials|admin\/resident-accounts)(\/|$)/;
const WRITES = ['POST', 'PUT', 'PATCH', 'DELETE'];

function auditTrail(req, res, next) {
  res.on('finish', () => {
    try {
      const path = req.originalUrl.split('?')[0];
      const isAdminLogin    = req.method === 'POST' && path === '/api/auth/login';
      const isResidentLogin = req.method === 'POST' && path === '/api/resident-accounts/login';
      const staff    = req.user || null;            // set by verifyToken
      const resident = req.residentPayload || null; // set by authenticateResident
      const write    = WRITES.includes(req.method);

      const staffEvent    = staff && (write || (req.method === 'GET' && SENSITIVE_AREAS.test(path)));
      const residentEvent = resident && write;
      if (!isAdminLogin && !isResidentLogin && !staffEvent && !residentEvent) return;

      let action = req.method;
      if (isAdminLogin || isResidentLogin) action = res.statusCode < 400 ? 'LOGIN_OK' : 'LOGIN_FAIL';

      AuditLog.create({
        userId: staff ? staff.id : resident ? resident.userId : null,
        role: staff ? staff.role : resident ? 'resident' : null,
        action,
        path: path.slice(0, 300),
        statusCode: res.statusCode,
        ipAddress: String(req.ip || '').slice(0, 64),
        // For logins, keep the e-mail that was tried so repeated guessing can be traced.
        detail: (isAdminLogin || isResidentLogin) && req.body && req.body.email
          ? String(req.body.email).toLowerCase().slice(0, 255)
          : null,
      }).catch(() => {}); // a logging problem must never break a request
    } catch (e) { /* ignore */ }
  });
  next();
}

module.exports = auditTrail;
