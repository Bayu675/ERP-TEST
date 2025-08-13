// File: migrations/YYYYMMDDHHMMSS-create-variant-value.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VariantValues', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      variantId: { type: Sequelize.UUID, allowNull: false, references: { model: 'ProductVariants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      attributeValueId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'AttributeValues', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('VariantValues'); }
};