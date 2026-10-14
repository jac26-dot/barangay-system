const { Op } = require('sequelize');
const VerificationLog = require('../models/VerificationLog');
const AuditLog = require('../models/AuditLog');

// Personal data should not be kept longer than it is needed.
//  - verification_logs hold names, birth dates and addresses typed by
//    people who may not even be residents: keep 90 days.
//  - audit_logs hold who accessed what: keep 2 years.
// Change the numbers with these environment variables on Render.
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function purge() {
  try {
    const verifyDays = Number(process.env.VERIFICATION_LOG_RETENTION_DAYS) || 90;
    const auditDays  = Number(process.env.AUDIT_LOG_RETENTION_DAYS) || 730;
    await VerificationLog.destroy({ where: { createdAt: { [Op.lt]: daysAgo(verifyDays) } } });
    await AuditLog.destroy({ where: { createdAt: { [Op.lt]: daysAgo(auditDays) } } });
  } catch (e) {
    console.error('Retention clean-up failed:', e.message);
  }
}

setTimeout(purge, 60 * 1000).unref();
setInterval(purge, 24 * 60 * 60 * 1000).unref();

module.exports = { purge };
