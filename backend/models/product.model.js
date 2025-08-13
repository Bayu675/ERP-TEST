// File: models/product.model.js (Dirombak Total)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.ProductCategory, { foreignKey: 'productCategoryId', as: 'category' });
      Product.belongsTo(models.SubCategory, { foreignKey: 'subCategoryId', as: 'subcategory' }); // Asosiasi baru
      Product.belongsTo(models.Brand, { foreignKey: 'brandId', as: 'brand' }); // Asosiasi baru
      Product.belongsTo(models.UnitOfMeasure, { foreignKey: 'uomId', as: 'uom' });
      Product.belongsTo(models.Tax, { foreignKey: 'taxId', as: 'tax' });
      Product.hasMany(models.ProductVariant, { foreignKey: 'productId', as: 'variants' });
    }
  }
  Product.init({
    // --- Field yang Sudah Ada ---
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }, // Dibuat opsional
    productType: { type: DataTypes.ENUM('TRADED_GOOD', 'FINISHED_GOOD', 'RAW_MATERIAL', 'SERVICE', 'SUB_ASSEMBLY'), allowNull: false, defaultValue: 'TRADED_GOOD' },
    status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' },
    productCategoryId: DataTypes.INTEGER,
    uomId: DataTypes.INTEGER,
    taxId: DataTypes.INTEGER,
    standardSalePrice: DataTypes.DECIMAL(15, 2),
    isTracked: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasVariants: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // --- FIELD BARU ---
    subCategoryId: { type: DataTypes.INTEGER, allowNull: true },
    brandId: { type: DataTypes.INTEGER, allowNull: true },
    tags: { type: DataTypes.JSONB, allowNull: true }, // Untuk menyimpan array tags
    purchasePrice: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    noDiscount: { type: DataTypes.BOOLEAN, defaultValue: false }, // Checkbox "Harga Bersih"
    reorderPoint: { type: DataTypes.INTEGER, allowNull: true },
    lotNumberTracking: { type: DataTypes.BOOLEAN, defaultValue: false }, // Checkbox "Lacak Lot"
    isBundle: { type: DataTypes.BOOLEAN, defaultValue: false }, // Checkbox "Produk Bundle/BOM"
    isService: { type: DataTypes.BOOLEAN, defaultValue: false }, // Checkbox "Produk Jasa"

    // Field lama yang mungkin tidak terpakai lagi, bisa dihapus nanti
    lastPurchasePrice: DataTypes.DECIMAL(15, 2),
    barcode: DataTypes.STRING,
    weight: DataTypes.FLOAT,
    length: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};
