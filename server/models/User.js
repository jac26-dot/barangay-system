const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff', 'viewer', 'resident'),
    defaultValue: 'staff',
  },
  residentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  accountStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Approved', // admin/staff default approved; residents are explicitly set to 'Pending' at registration
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true, // stores a base64 data URI for the resident's profile/ID photo
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // admin/staff accounts don't go through OTP; residents get this set to false at registration
  },
  otpHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  otpAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  otpLastSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
