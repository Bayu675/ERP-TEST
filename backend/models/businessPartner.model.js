// File: models/businessPartner.model.js (dengan Field Salesman)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BusinessPartner extends Model {
    static associate(models) {
      BusinessPartner.belongsTo(models.BusinessPartnerGroup, { foreignKey: 'partnerGroupId', as: 'group' });
      
      // --- TAMBAHKAN ASOSIASI BARU INI ---
      // Setiap Mitra Bisnis ditangani oleh satu Salesman (User)
      BusinessPartner.belongsTo(models.User, { foreignKey: 'salespersonId', as: 'salesperson' });
    }
  }
  BusinessPartner.init({
    partnerGroupId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    
    // --- TAMBAHKAN FIELD BARU INI ---
    salespersonId: {
      type: DataTypes.UUID, // Harus cocok dengan tipe ID di model User
      allowNull: true, // Bisa diubah menjadi false jika setiap customer WAJIB punya salesman
    },
    // --- AKHIR PENAMBAHAN ---

    companyName: DataTypes.STRING,
    taxId: DataTypes.STRING,
    paymentTerm: DataTypes.INTEGER,
    contactPerson: DataTypes.STRING,
    email: { 
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' }
  }, {
    sequelize,
    modelName: 'BusinessPartner',
  });
  return BusinessPartner;
};
