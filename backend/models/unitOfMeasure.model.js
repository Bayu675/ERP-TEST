// File: models/unitOfMeasure.model.js (Diperbarui dengan Konversi Satuan)
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UnitOfMeasure extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UnitOfMeasure.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // --- KOLOM BARU UNTUK KONVERSI SATUAN ---
    uomType: {
      type: DataTypes.STRING, // Tipe satuan, misal: 'panjang', 'berat', 'volume'
      allowNull: false,
      defaultValue: 'lainnya'
    },
    factor: {
      type: DataTypes.FLOAT, // Faktor konversi ke satuan dasar (misal: mm untuk panjang)
      allowNull: false,
      defaultValue: 1
    }
    // --- AKHIR PENAMBAHAN ---
  }, {
    sequelize,
    modelName: 'UnitOfMeasure',
  });
  return UnitOfMeasure;
};
