// File: migrations/YYYYMMDDHHMMSS-create-quotation-item-discount.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuotationItemDiscounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quotationItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'QuotationItems', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      discountPercentage: {
        type: Sequelize.FLOAT,
        allowNull: false
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
    await queryInterface.dropTable('QuotationItemDiscounts');
  }
};
