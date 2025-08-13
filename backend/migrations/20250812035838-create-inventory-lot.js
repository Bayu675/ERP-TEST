'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InventoryLots', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Products', key: 'id' } },
      lotNumber: { type: Sequelize.STRING, allowNull: false },
      initialQuantity: { type: Sequelize.FLOAT, allowNull: false },
      currentQuantity: { type: Sequelize.FLOAT, allowNull: false },
      uomId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'UnitOfMeasures', key: 'id' } },
      receivedDate: { type: Sequelize.DATE, allowNull: false },
      expiryDate: { type: Sequelize.DATE },
      costPerUnit: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('InventoryLots');
  }
};