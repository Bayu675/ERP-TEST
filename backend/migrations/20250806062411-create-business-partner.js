// File: migrations/YYYYMMDDHHMMSS-create-business-partner.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BusinessPartners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      partnerType: {
        type: Sequelize.ENUM('CUSTOMER', 'SUPPLIER'),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      companyName: {
        type: Sequelize.STRING
      },
      taxId: { // NPWP
        type: Sequelize.STRING
      },
      paymentTerm: { // Termin Pembayaran (misal: 30 hari)
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Info Kontak Utama
      contactPerson: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      // Info Alamat Utama
      address: {
        type: Sequelize.TEXT
      },
      city: {
        type: Sequelize.STRING
      },
      province: {
        type: Sequelize.STRING
      },
      postalCode: {
        type: Sequelize.STRING
      },
      // Status untuk Soft Delete
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BusinessPartners');
  }
};