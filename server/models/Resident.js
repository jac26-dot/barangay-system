const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resident = sequelize.define('Resident', {
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
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: false,
  },
  civilStatus: {
    type: DataTypes.ENUM('Single', 'Married', 'Widowed', 'Separated'),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true },
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVoter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isIndigent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSeniorCitizen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Deceased', 'Transferred'),
    defaultValue: 'Active',
  },
}, {
  tableName: 'residents',
  timestamps: true,
});

module.exports = Resident;
