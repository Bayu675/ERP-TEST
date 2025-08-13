// File: models/productAttribute.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductAttribute extends Model {
    static associate(models) {
      ProductAttribute.hasMany(models.AttributeValue, { foreignKey: 'attributeId', as: 'values' });
    }
  }
  ProductAttribute.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'ProductAttribute',
  });
  return ProductAttribute;
};