// File: models/billOfMaterial.model.js (BARU)
// Model ini merepresentasikan "resep" atau header BOM.

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BillOfMaterial extends Model {
    static associate(models) {
      // Setiap BOM milik satu Produk (barang jadi)
      BillOfMaterial.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      // Setiap BOM memiliki banyak Item (komponen)
      BillOfMaterial.hasMany(models.BillOfMaterialItem, { foreignKey: 'bomId', as: 'items' });
    }
  }
  BillOfMaterial.init({
    productId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    combination: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'BillOfMaterial',
  });
  return BillOfMaterial;
};