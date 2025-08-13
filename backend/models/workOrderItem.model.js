// File: models/workOrderItem.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkOrderItem extends Model {
    static associate(models) {
      WorkOrderItem.belongsTo(models.WorkOrder, { foreignKey: 'workOrderId' });
      WorkOrderItem.belongsTo(models.Product, { foreignKey: 'componentId', as: 'component' });
      WorkOrderItem.belongsTo(models.UnitOfMeasure, { foreignKey: 'uomId' });
    }
  }
  WorkOrderItem.init({
    workOrderId: { type: DataTypes.INTEGER, allowNull: false },
    componentId: { type: DataTypes.UUID, allowNull: false },
    description: DataTypes.TEXT,
    requiredQuantity: { type: DataTypes.FLOAT, allowNull: false },
    uomId: { type: DataTypes.INTEGER, allowNull: false },
    notes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'WorkOrderItem',
  });
  return WorkOrderItem;
};