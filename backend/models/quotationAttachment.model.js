// File: models/quotationAttachment.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuotationAttachment extends Model {
    static associate(models) {
      // Setiap lampiran milik satu Penawaran
      QuotationAttachment.belongsTo(models.Quotation, { foreignKey: 'quotationId' });
      // Setiap lampiran diunggah oleh satu User
      QuotationAttachment.belongsTo(models.User, { foreignKey: 'uploadedBy' });
    }
  }
  QuotationAttachment.init({
    quotationId: { type: DataTypes.INTEGER, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    fileType: DataTypes.STRING,
    uploadedBy: { type: DataTypes.UUID, allowNull: false }
  }, {
    sequelize,
    modelName: 'QuotationAttachment',
  });
  return QuotationAttachment;
};