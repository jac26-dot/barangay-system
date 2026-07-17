const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Blotter = sequelize.define('Blotter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  caseNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  complainantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  respondentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  incidentType: {
    type: DataTypes.ENUM(
      'Physical Assault',
      'Verbal Abuse',
      'Property Dispute',
      'Noise Complaint',
      'Theft',
      'Trespassing',
      'Domestic Violence',
      'Others'
    ),
    allowNull: false,
  },
  incidentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  incidentLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  narrative: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Open', 'Ongoing', 'Settled', 'Escalated', 'Closed'),
    defaultValue: 'Open',
  },
  assignedOfficialId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'blotters',
  timestamps: true,
});

module.exports = Blotter;
