// File: migrations/YYYYMMDDHHMMSS-create-quotation.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Quotations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quotationNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'BusinessPartners', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Jangan hapus pelanggan jika masih punya penawaran
      },
      salespersonId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quotationDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiryDate: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      subTotal: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      totalItemDiscount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      headerDiscountValue: {
        type: Sequelize.STRING, // misal: "5%" atau "50000"
      },
      headerDiscountAmount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      taxableAmount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      totalTax: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      grandTotal: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT
      },
      terms: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Quotations');
  }
};