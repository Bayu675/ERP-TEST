// File: migrations/YYYYMMDDHHMMSS-create-bill-of-material.js (UPDATE)
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BillOfMaterials', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      // TAMBAHKAN KOLOM INI
      combination: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('BillOfMaterials'); }
};
