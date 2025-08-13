// File: migrations/YYYYMMDDHHMMSS-create-price-configuration.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PriceConfigurations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products', // Nama tabel yang direferensikan
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      combination: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      pricePerSquareMeter: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      minCalculationWidth: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      minCalculationHeight: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      calculationRule: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('PriceConfigurations');
  }
};
