// File: models/billOfMaterialItem.model.js (BARU)
// Model ini merepresentasikan setiap baris komponen di dalam sebuah resep (BOM).

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BillOfMaterialItem extends Model {
    static associate(models) {
      // Setiap item milik satu BOM
      BillOfMaterialItem.belongsTo(models.BillOfMaterial, { foreignKey: 'bomId' });
      // Setiap item menunjuk ke satu Produk (komponen)
      BillOfMaterialItem.belongsTo(models.Product, { foreignKey: 'componentId', as: 'component' });
    }
  }
  BillOfMaterialItem.init({
    bomId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    componentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantityFormula: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'BillOfMaterialItem',
  });
  return BillOfMaterialItem;
};
