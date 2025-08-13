// File: migrations/YYYYMMDDHHMMSS-create-attribute-value.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AttributeValues', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      attributeId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'ProductAttributes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      value: { type: Sequelize.STRING, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await queryInterface.addConstraint('AttributeValues', { fields: ['attributeId', 'value'], type: 'unique', name: 'attribute_value_unique_constraint' });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('AttributeValues'); }
};