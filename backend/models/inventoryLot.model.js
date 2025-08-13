// File: backend/models/inventoryLot.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryLot extends Model {
    static associate(models) {
      InventoryLot.belongsTo(models.Product, { foreignKey: 'productId' });
      InventoryLot.belongsTo(models.UnitOfMeasure, { foreignKey: 'uomId' });
    }
  }
  InventoryLot.init({
    productId: { type: DataTypes.UUID, allowNull: false },
    lotNumber: { type: DataTypes.STRING, allowNull: false },
    initialQuantity: { type: DataTypes.FLOAT, allowNull: false },
    currentQuantity: { type: DataTypes.FLOAT, allowNull: false },
    uomId: { type: DataTypes.INTEGER, allowNull: false },
    receivedDate: { type: DataTypes.DATE, allowNull: false },
    expiryDate: DataTypes.DATE,
    costPerUnit: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  }, {
    sequelize,
    modelName: 'InventoryLot',
  });
  return InventoryLot;
};
