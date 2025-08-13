// File: models/tax.model.js (UPDATE)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tax extends Model {
    static associate(models) {
      // AKTIFKAN KEMBALI RELASI INI
      Tax.hasMany(models.Product, { foreignKey: 'taxId' });
    }
  }
  Tax.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    rate: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0 } },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Tax',
  });
  return Tax;
};