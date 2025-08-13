// File: models/priceConfiguration.model.js
// Versi ini memastikan modelName dan relasi sudah benar.

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PriceConfiguration extends Model {
    static associate(models) {
      // Mendefinisikan relasi: Setiap PriceConfiguration milik satu Product.
      PriceConfiguration.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }
  PriceConfiguration.init({
    productId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    combination: {
      type: DataTypes.JSONB, // Menggunakan JSONB untuk efisiensi di PostgreSQL
      allowNull: false
    },
    pricePerSquareMeter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    minCalculationWidth: DataTypes.FLOAT,
    minCalculationHeight: DataTypes.FLOAT,
    calculationRule: DataTypes.STRING
  }, {
    sequelize,
    // Pastikan modelName ini persis 'PriceConfiguration'
    modelName: 'PriceConfiguration',
  });
  return PriceConfiguration;
};
