// File: models/businessPartnerGroup.model.js (Diskon Diubah ke String)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BusinessPartnerGroup extends Model {
    static associate(models) {
      BusinessPartnerGroup.hasMany(models.BusinessPartner, { foreignKey: 'partnerGroupId' });
    }
  }
  BusinessPartnerGroup.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    // --- PERUBAHAN DI SINI ---
    // Mengubah tipe data menjadi STRING untuk menampung diskon bertingkat
    defaultDiscount: { 
      type: DataTypes.STRING, 
      allowNull: true, // Izinkan kosong
      defaultValue: '0' // Default sebagai string '0'
    }
    // --- AKHIR PERUBAHAN ---
  }, {
    sequelize,
    modelName: 'BusinessPartnerGroup',
  });
  return BusinessPartnerGroup;
};
