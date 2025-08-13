// File: migrations/YYYYMMDDHHMMSS-create-sales-order-item.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SalesOrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      salesOrderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'SalesOrders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Semua detail item akan disalin dari QuotationItems
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' }
      },
      description: { type: Sequelize.TEXT },
      width: { type: Sequelize.FLOAT },
      height: { type: Sequelize.FLOAT },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      netPrice: { type: Sequelize.DECIMAL(15, 2) },
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
    await queryInterface.dropTable('SalesOrderItems');
  }
};