// File: migrations/YYYYMMDDHHMMSS-create-sales-order.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SalesOrders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      salesOrderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      quotationId: { // Untuk melacak asal SO
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Quotations', key: 'id' }
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'BusinessPartners', key: 'id' }
      },
      salespersonId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      orderDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'INVOICED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      // Kolom harga dan total akan disalin dari penawaran
      grandTotal: {
        type: Sequelize.DECIMAL(15, 2),
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
    await queryInterface.dropTable('SalesOrders');
  }
};