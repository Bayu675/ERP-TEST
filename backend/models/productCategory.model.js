// File: models/productCategory.model.js (UPDATE)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    static associate(models) {
      // AKTIFKAN KEMBALI RELASI INI
      ProductCategory.hasMany(models.Product, { foreignKey: 'productCategoryId' });
    }
  }
  ProductCategory.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ProductCategory',
  });
  return ProductCategory;
};