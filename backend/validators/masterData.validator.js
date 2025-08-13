// File: validators/masterData.validator.js (Diperbarui dengan Brand & SubCategory)
const { body } = require('express-validator');

const categoryRules = [
  body('name').trim().notEmpty().withMessage('Nama kategori tidak boleh kosong.'),
];

const uomRules = [
  body('name').trim().notEmpty().withMessage('Nama satuan unit tidak boleh kosong.'),
  body('symbol').trim().notEmpty().withMessage('Simbol tidak boleh kosong.'),
];

const taxRules = [
  body('name').trim().notEmpty().withMessage('Nama pajak tidak boleh kosong.'),
  body('rate').isFloat({ min: 0 }).withMessage('Tarif pajak harus berupa angka dan tidak boleh negatif.'),
];

// --- ATURAN VALIDASI BARU ---
const brandRules = [
  body('name').trim().notEmpty().withMessage('Nama brand tidak boleh kosong.'),
];

const subCategoryRules = [
  body('name').trim().notEmpty().withMessage('Nama subkategori tidak boleh kosong.'),
  body('productCategoryId').isInt({ min: 1 }).withMessage('Kategori induk harus dipilih.'),
];

module.exports = {
  categoryRules,
  uomRules,
  taxRules,
  brandRules, // Ekspor aturan baru
  subCategoryRules, // Ekspor aturan baru
};
