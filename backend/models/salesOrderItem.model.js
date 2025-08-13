// File: models/salesOrderItem.model.js (UPDATE)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalesOrderItem extends Model {
    static associate(models) {
      SalesOrderItem.belongsTo(models.SalesOrder, { foreignKey: 'salesOrderId' });
      SalesOrderItem.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }
  SalesOrderItem.init({
    salesOrderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    description: DataTypes.TEXT,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    netPrice: DataTypes.DECIMAL(15, 2),
    quantityShipped: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'SalesOrderItem',
  });
  return SalesOrderItem;
};