// File: models/quotation.model.js (UPDATE)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quotation extends Model {
    static associate(models) {
      Quotation.belongsTo(models.BusinessPartner, { foreignKey: 'customerId', as: 'customer' });
      Quotation.belongsTo(models.User, { foreignKey: 'salespersonId', as: 'salesperson' });
      Quotation.hasMany(models.QuotationItem, { foreignKey: 'quotationId', as: 'items' });
      // TAMBAHKAN RELASI BARU INI
      Quotation.hasMany(models.QuotationAttachment, { foreignKey: 'quotationId', as: 'attachments' });
    }
  }
  Quotation.init({
    quotationNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    salespersonId: { type: DataTypes.UUID, allowNull: false },
    quotationDate: { type: DataTypes.DATE, allowNull: false },
    expiryDate: DataTypes.DATE,
    // PERBARUI ENUM STATUS
    status: { type: DataTypes.ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'), allowNull: false, defaultValue: 'DRAFT' },
    // TAMBAHKAN KOLOM BARU
    convertedToSalesOrderId: DataTypes.INTEGER,
    convertedAt: DataTypes.DATE,
    subTotal: DataTypes.DECIMAL(15, 2),
    totalItemDiscount: DataTypes.DECIMAL(15, 2),
    headerDiscountValue: DataTypes.STRING,
    headerDiscountAmount: DataTypes.DECIMAL(15, 2),
    taxableAmount: DataTypes.DECIMAL(15, 2),
    totalTax: DataTypes.DECIMAL(15, 2),
    grandTotal: DataTypes.DECIMAL(15, 2),
    notes: DataTypes.TEXT,
    terms: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Quotation',
  });
  return Quotation;
};