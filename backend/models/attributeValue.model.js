// File: models/attributeValue.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AttributeValue extends Model {
    static associate(models) {
      AttributeValue.belongsTo(models.ProductAttribute, { foreignKey: 'attributeId', as: 'attribute' });
      AttributeValue.belongsToMany(models.ProductVariant, { through: 'VariantValues', foreignKey: 'attributeValueId', as: 'variants' });
    }
  }
  AttributeValue.init({
    attributeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'AttributeValue',
  });
  return AttributeValue;
};