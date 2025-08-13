// File: models/workOrder.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkOrder extends Model {
    static associate(models) {
      WorkOrder.belongsTo(models.SalesOrder, { foreignKey: 'salesOrderId' });
      WorkOrder.hasMany(models.WorkOrderItem, { foreignKey: 'workOrderId', as: 'items' });
    }
  }
  WorkOrder.init({
    workOrderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    salesOrderId: { type: DataTypes.INTEGER, allowNull: false },
    issueDate: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'), defaultValue: 'PENDING' },
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'WorkOrder',
  });
  return WorkOrder;
};