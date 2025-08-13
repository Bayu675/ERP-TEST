// File: validators/product.validator.js (Dirombak untuk Form Detail)
'use strict';
const { body } = require('express-validator');

const productRules = [
  // Tab 1: Informasi Utama
  body('name').trim().notEmpty().withMessage('Nama produk tidak boleh kosong.'),
  body('sku').trim().notEmpty().withMessage('SKU tidak boleh kosong.'),
  body('productType').isIn(['TRADED_GOOD', 'FINISHED_GOOD', 'RAW_MATERIAL', 'SERVICE', 'SUB_ASSEMBLY']).withMessage('Jenis produk tidak valid.'),
  body('productCategoryId').optional({ checkFalsy: true }).isInt().withMessage('ID Kategori Produk tidak valid.'),
  body('subCategoryId').optional({ checkFalsy: true }).isInt().withMessage('ID Subkategori tidak valid.'),
  body('brandId').optional({ checkFalsy: true }).isInt().withMessage('ID Brand tidak valid.'),
  body('uomId').optional({ checkFalsy: true }).isInt().withMessage('ID Satuan Unit tidak valid.'),
  
  // Tab 2: Harga & Stok
  body('purchasePrice').optional({ checkFalsy: true }).isDecimal().withMessage('Harga beli harus berupa angka.'),
  body('standardSalePrice').optional({ checkFalsy: true }).isDecimal().withMessage('Harga jual harus berupa angka.'),
  body('noDiscount').isBoolean().withMessage('Nilai "No Discount" harus boolean.'),
  body('isTracked').isBoolean().withMessage('Nilai "Lacak Stok" harus boolean.'),
  body('reorderPoint').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Minimal stok harus angka positif.'),
  body('lotNumberTracking').isBoolean().withMessage('Nilai "Lacak Lot" harus boolean.'),

  // Tab 3: Pengaturan Lainnya
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status tidak valid.'),
  body('isBundle').isBoolean().withMessage('Nilai "Bundle" harus boolean.'),
  body('isService').isBoolean().withMessage('Nilai "Jasa" harus boolean.'),
];


module.exports = {
  // Kita hanya butuh satu set aturan karena formnya kompleks
  createProductRules: productRules,
  updateProductRules: productRules,
};
