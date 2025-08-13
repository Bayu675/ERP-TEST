// File: migrations/YYYYMMDDHHMMSS-create-product-variant.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductVariants', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      sku: { type: Sequelize.STRING, allowNull: false, unique: true },
      price: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('ProductVariants'); }
};