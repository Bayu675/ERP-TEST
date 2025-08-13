// File: backend/models/subCategory.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubCategory extends Model {
    static associate(models) {
      SubCategory.belongsTo(models.ProductCategory, { foreignKey: 'productCategoryId', as: 'category' });
      SubCategory.hasMany(models.Product, { foreignKey: 'subCategoryId' });
    }
  }
  SubCategory.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProductCategories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'SubCategory',
  });
  return SubCategory;
};