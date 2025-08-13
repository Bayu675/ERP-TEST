// File: models/salesOrder.model.js (UPDATE)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalesOrder extends Model {
    static associate(models) {
      SalesOrder.belongsTo(models.Quotation, { foreignKey: 'quotationId' });
      SalesOrder.belongsTo(models.BusinessPartner, { foreignKey: 'customerId', as: 'customer' });
      SalesOrder.belongsTo(models.User, { foreignKey: 'salespersonId', as: 'salesperson' });
      SalesOrder.belongsTo(models.PaymentTerm, { foreignKey: 'paymentTermId' });
      SalesOrder.hasMany(models.SalesOrderItem, { foreignKey: 'salesOrderId', as: 'items' });
    }
  }
  SalesOrder.init({
    salesOrderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    quotationId: DataTypes.INTEGER,
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    salespersonId: { type: DataTypes.UUID, allowNull: false },
    paymentTermId: DataTypes.INTEGER,
    orderDate: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'INVOICED', 'CANCELLED'), defaultValue: 'DRAFT' },
    paymentStatus: { type: DataTypes.ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID'), defaultValue: 'UNPAID' },
    downPaymentRequired: DataTypes.DECIMAL(15, 2),
    grandTotal: DataTypes.DECIMAL(15, 2),
    customerPoNumber: DataTypes.STRING,
    deliveryMethod: DataTypes.ENUM('EXPEDITION', 'PICKUP', 'COMPANY_DRIVER', 'WAITING'),
    useCompanyLogo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    sequelize,
    modelName: 'SalesOrder',
  });
  return SalesOrder;
};