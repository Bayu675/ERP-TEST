// File: migrations/YYYYMMDDHHMMSS-create-quotation-item.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuotationItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quotationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Quotations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Jika penawaran dihapus, itemnya ikut terhapus
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      description: {
        type: Sequelize.TEXT
      },
      width: {
        type: Sequelize.FLOAT
      },
      height: {
        type: Sequelize.FLOAT
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      calculatedArea: {
        type: Sequelize.FLOAT
      },
      pricePerArea: {
        type: Sequelize.DECIMAL(15, 2)
      },
      basePrice: {
        type: Sequelize.DECIMAL(15, 2)
      },
      netPrice: {
        type: Sequelize.DECIMAL(15, 2)
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
    await queryInterface.dropTable('QuotationItems');
  }
};