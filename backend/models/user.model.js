// File: models/user.model.js
// Versi ini sudah diperbaiki dengan hook untuk hashing password.

'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt'); // Pastikan bcrypt diimpor

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Definisikan asosiasi di sini jika ada
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'sales'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    hooks: {
      // INI ADALAH BAGIAN YANG PALING PENTING
      // Hook ini akan berjalan secara otomatis sebelum user dibuat
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });
  return User;
};
