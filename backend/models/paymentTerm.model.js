// File: models/paymentTerm.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentTerm extends Model {
    static associate(models) {
      PaymentTerm.hasMany(models.SalesOrder, { foreignKey: 'paymentTermId' });
    }
  }
  PaymentTerm.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    downPaymentPercentage: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PaymentTerm',
  });
  return PaymentTerm;
};