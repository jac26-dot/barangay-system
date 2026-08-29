const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationLog = sequelize.define('VerificationLog', {
  submittedFirstName:    { type: DataTypes.STRING, allowNull: false, field: 'submitted_first_name' },
  submittedLastName:     { type: DataTypes.STRING, allowNull: false, field: 'submitted_last_name' },
  submittedBirthDate:    { type: DataTypes.DATEONLY, field: 'submitted_birth_date' },
  submittedAddress:      { type: DataTypes.STRING, field: 'submitted_address' },
  submittedContactNumber:{ type: DataTypes.STRING, field: 'submitted_contact_number' },
  matchedResidentId:     { type: DataTypes.INTEGER, field: 'matched_resident_id' },
  status:                { type: DataTypes.ENUM('Verified', 'Failed'), allowNull: false },
  ipAddress:              { type: DataTypes.STRING, field: 'ip_address' },
}, {
  tableName: 'verification_logs',
  timestamps: true,
  updatedAt: false,
});

module.exports = VerificationLog;
