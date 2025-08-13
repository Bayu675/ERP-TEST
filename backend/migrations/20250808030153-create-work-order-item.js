// File: migrations/YYYYMMDDHHMMSS-create-work-order-item.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WorkOrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      workOrderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'WorkOrders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      componentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      description: {
        type: Sequelize.TEXT
      },
      requiredQuantity: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      uomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'UnitOfMeasures', key: 'id' }
      },
      notes: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('WorkOrderItems');
  }
};