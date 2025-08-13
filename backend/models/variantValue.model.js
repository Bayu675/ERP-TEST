// File: models/variantValue.model.js (BARU) - Ini adalah model untuk tabel penghubung
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VariantValue extends Model {
    static associate(models) {
      // Tidak perlu asosiasi eksplisit di sini
    }
  }
  VariantValue.init({
    variantId: { type: DataTypes.UUID, allowNull: false },
    attributeValueId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: 'VariantValue',
  });
  return VariantValue;
};