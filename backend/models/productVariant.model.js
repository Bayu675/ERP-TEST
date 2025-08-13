// File: models/productVariant.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      ProductVariant.belongsToMany(models.AttributeValue, { through: 'VariantValues', foreignKey: 'variantId', as: 'attributes' });
    }
  }
  ProductVariant.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    productId: { type: DataTypes.UUID, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    price: DataTypes.DECIMAL(15, 2),
  }, {
    sequelize,
    modelName: 'ProductVariant',
  });
  return ProductVariant;
};