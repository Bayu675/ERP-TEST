// File: models/quotationItem.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuotationItem extends Model {
    static associate(models) {
      // Setiap item milik satu Penawaran (Quotation)
      QuotationItem.belongsTo(models.Quotation, { foreignKey: 'quotationId' });
      // Setiap item menunjuk ke satu Produk
      QuotationItem.belongsTo(models.Product, { foreignKey: 'productId' });
      // Setiap item bisa memiliki banyak lapisan diskon
      QuotationItem.hasMany(models.QuotationItemDiscount, { foreignKey: 'quotationItemId', as: 'discounts' });
    }
  }
  QuotationItem.init({
    quotationId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    description: DataTypes.TEXT,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    calculatedArea: DataTypes.FLOAT,
    pricePerArea: DataTypes.DECIMAL(15, 2),
    basePrice: DataTypes.DECIMAL(15, 2),
    netPrice: DataTypes.DECIMAL(15, 2),
    notes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'QuotationItem',
  });
  return QuotationItem;
};