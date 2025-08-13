// File: backend/models/productLink.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductLink extends Model {
    static associate(models) {
      ProductLink.belongsTo(models.Product, { foreignKey: 'productId' });
      ProductLink.belongsTo(models.ConfigTemplate, { foreignKey: 'templateId' });
    }
  }
  ProductLink.init({
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true // Satu produk hanya bisa punya satu template
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProductLink',
  });
  return ProductLink;
};
