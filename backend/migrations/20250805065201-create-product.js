// File: migrations/YYYYMMDDHHMMSS-create-product.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      sku: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      productType: { type: Sequelize.ENUM('TRADED_GOOD', 'FINISHED_GOOD', 'RAW_MATERIAL', 'SERVICE', 'SUB_ASSEMBLY'), allowNull: false, defaultValue: 'TRADED_GOOD' },
      status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' },
      productCategoryId: { type: Sequelize.INTEGER, references: { model: 'ProductCategories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      uomId: { type: Sequelize.INTEGER, references: { model: 'UnitOfMeasures', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      taxId: { type: Sequelize.INTEGER, references: { model: 'Taxes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      standardSalePrice: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      lastPurchasePrice: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      isTracked: { type: Sequelize.BOOLEAN, defaultValue: true },
      reorderPoint: { type: Sequelize.INTEGER, defaultValue: 0 },
      barcode: { type: Sequelize.STRING },
      weight: { type: Sequelize.FLOAT, defaultValue: 0 },
      length: { type: Sequelize.FLOAT, defaultValue: 0 },
      width: { type: Sequelize.FLOAT, defaultValue: 0 },
      height: { type: Sequelize.FLOAT, defaultValue: 0 },
      hasVariants: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('Products'); }
};