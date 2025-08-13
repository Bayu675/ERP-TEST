// File: validators/quotation.validator.js (UPDATE)
'use strict';
const { body } = require('express-validator');

// Aturan ketat untuk MEMBUAT penawaran baru
const createQuotationRules = [
  body('customerId').isInt({ min: 1 }).withMessage('ID Pelanggan harus diisi.'),
  body('quotationDate').isISO8601().toDate().withMessage('Format tanggal penawaran tidak valid.'),
  body('items').isArray({ min: 1 }).withMessage('Penawaran harus memiliki minimal satu item.'),
  body('items.*.productId').isUUID().withMessage('ID Produk tidak valid untuk setiap item.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Kuantitas harus minimal 1.'),
  body('items.*.width').isFloat({ min: 0 }).withMessage('Lebar harus berupa angka.'),
  body('items.*.height').isFloat({ min: 0 }).withMessage('Tinggi harus berupa angka.'),
  body('items.*.discounts').optional().isArray().withMessage('Diskon harus berupa array.'),
  body('items.*.discounts.*.percentage').isFloat({ min: 0, max: 100 }).withMessage('Persentase diskon tidak valid.'),
];

// Aturan fleksibel untuk MENGUPDATE penawaran
const updateQuotationRules = [
  // Saat update, semua field bersifat opsional
  body('customerId').optional().isInt({ min: 1 }).withMessage('ID Pelanggan harus diisi.'),
  body('quotationDate').optional().isISO8601().toDate().withMessage('Format tanggal penawaran tidak valid.'),
  body('items').optional().isArray({ min: 1 }).withMessage('Penawaran harus memiliki minimal satu item.'),
  body('status').optional().isIn(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED']).withMessage('Status tidak valid.'),
];

module.exports = {
  quotationRules: createQuotationRules, // Tetap ekspor sebagai quotationRules untuk konsistensi
  updateQuotationRules,
};