const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Who touched which records, and when. It stores the route and the
// result only - never the request body, so it holds no copy of the
// personal data itself.
const AuditLog = sequelize.define('AuditLog', {
  userId:     { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  role:       { type: DataTypes.STRING(20), allowNull: true },
  action:     { type: DataTypes.STRING(10), allowNull: false },
  path:       { type: DataTypes.STRING(300), allowNull: false },
  statusCode: { type: DataTypes.INTEGER, allowNull: false, field: 'status_code' },
  ipAddress:  { type: DataTypes.STRING(64), allowNull: true, field: 'ip_address' },
  detail:     { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
});

// Create the table on first start if it is not there yet.
AuditLog.sync().catch((e) => console.error('Could not prepare audit_logs table:', e.message));

module.exports = AuditLog;
