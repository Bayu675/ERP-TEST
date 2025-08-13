// File: migrations/YYYYMMDDHHMMSS-create-sales-order.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SalesOrders', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      salesOrderNumber: { type: Sequelize.STRING, allowNull: false, unique: true },
      quotationId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Quotations', key: 'id' } },
      customerId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'BusinessPartners', key: 'id' } },
      salespersonId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
      paymentTermId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'PaymentTerms', key: 'id' } },
      orderDate: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.ENUM('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'INVOICED', 'CANCELLED'), allowNull: false, defaultValue: 'DRAFT' },
      paymentStatus: { type: Sequelize.ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID'), defaultValue: 'UNPAID' },
      downPaymentRequired: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      grandTotal: { type: Sequelize.DECIMAL(15, 2) },
      customerPoNumber: { type: Sequelize.STRING },
      deliveryMethod: { type: Sequelize.ENUM('EXPEDITION', 'PICKUP', 'COMPANY_DRIVER', 'WAITING') },
      useCompanyLogo: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SalesOrders');
  }
};