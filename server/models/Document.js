const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  residentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  documentType: {
    type: DataTypes.ENUM(
      'Barangay Clearance',
      'Certificate of Residency',
      'Certificate of Indigency',
      'Business Clearance',
      'Good Moral Certificate'
    ),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Released', 'Rejected'),
    defaultValue: 'Pending',
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  issuedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  releasedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  controlNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'documents',
  timestamps: true,
});

module.exports = Document;
