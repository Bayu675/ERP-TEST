// File: validators/variant.validator.js (BARU)
// Aturan validasi untuk data varian produk.

const { body } = require('express-validator');

const variantRules = [
  body('sku').trim().notEmpty().withMessage('SKU untuk varian tidak boleh kosong.'),
  body('price').optional().isDecimal().withMessage('Harga varian harus berupa angka.'),
  // Memastikan bahwa 'attributeValueIds' dikirim sebagai array berisi angka
  body('attributeValueIds')
    .isArray({ min: 1 }).withMessage('Harus ada minimal satu nilai atribut.')
    .custom((values) => {
      if (!values.every(Number.isInteger)) {
        throw new Error('Semua ID nilai atribut harus berupa angka (integer).');
      }
      return true;
    }),
];

module.exports = {
  variantRules,
};