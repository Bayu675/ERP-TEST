// File: migrations/YYYYMMDDHHMMSS-create-bom-item.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BillOfMaterialItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bomId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'BillOfMaterials', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      componentId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      quantityFormula: { type: Sequelize.STRING, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('BillOfMaterialItems'); }
};