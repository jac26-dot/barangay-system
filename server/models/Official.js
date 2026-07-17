const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Official = sequelize.define('Official', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.ENUM(
      'Barangay Captain',
      'Barangay Kagawad',
      'SK Chairman',
      'SK Kagawad',
      'Barangay Secretary',
      'Barangay Treasurer'
    ),
    allowNull: false,
  },
  committee: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  termStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  termEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'officials',
  timestamps: true,
});

module.exports = Official;
