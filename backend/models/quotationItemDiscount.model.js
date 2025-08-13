// File: models/quotationItemDiscount.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuotationItemDiscount extends Model {
    static associate(models) {
      // Setiap diskon milik satu Item Penawaran (QuotationItem)
      QuotationItemDiscount.belongsTo(models.QuotationItem, { foreignKey: 'quotationItemId' });
    }
  }
  QuotationItemDiscount.init({
    quotationItemId: { type: DataTypes.INTEGER, allowNull: false },
    sequence: { type: DataTypes.INTEGER, allowNull: false },
    discountPercentage: { type: DataTypes.FLOAT, allowNull: false }
  }, {
    sequelize,
    modelName: 'QuotationItemDiscount',
  });
  return QuotationItemDiscount;
};
