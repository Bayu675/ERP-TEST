// File: validators/salesOrder.validator.js (BARU)
'use strict';
const { body } = require('express-validator');

// Aturan validasi saat merevisi/mengupdate Sales Order
const updateSalesOrderRules = [
  // Saat update, semua field bersifat opsional
  body('customerId').optional().isInt({ min: 1 }).withMessage('ID Pelanggan harus diisi.'),
  body('orderDate').optional().isISO8601().toDate().withMessage('Format tanggal pesanan tidak valid.'),
  body('paymentTermId').optional().isInt({ min: 1 }).withMessage('ID Syarat Pembayaran tidak valid.'),
  body('deliveryMethod').optional().isIn(['EXPEDITION', 'PICKUP', 'COMPANY_DRIVER', 'WAITING']).withMessage('Metode pengiriman tidak valid.'),
  
  // Validasi untuk setiap item (jika dikirim)
  body('items').optional().isArray({ min: 1 }).withMessage('Pesanan harus memiliki minimal satu item.'),
  body('items.*.productId').isUUID().withMessage('ID Produk tidak valid untuk setiap item.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Kuantitas harus minimal 1.'),
  body('items.*.width').isFloat({ min: 0 }).withMessage('Lebar harus berupa angka.'),
  body('items.*.height').isFloat({ min: 0 }).withMessage('Tinggi harus berupa angka.'),
];

module.exports = {
  updateSalesOrderRules,
};