// File: validators/inventory.validator.js
'use strict';
const { body } = require('express-validator');

const createLotRules = [
  body('productId').isUUID().withMessage('ID Produk tidak valid.'),
  body('lotNumber').trim().notEmpty().withMessage('Nomor Lot tidak boleh kosong.'),
  body('initialQuantity').isFloat({ gt: 0 }).withMessage('Kuantitas awal harus lebih dari 0.'),
  body('uomId').isInt({ min: 1 }).withMessage('ID Satuan Unit tidak valid.'),
  body('receivedDate').isISO8601().toDate().withMessage('Format tanggal tidak valid.'),
  body('costPerUnit').isDecimal().withMessage('Biaya per unit harus berupa angka.'),
];

// --- ATURAN VALIDASI BARU ---
const adjustStockRules = [
    body('newTotalQuantity').isFloat().withMessage('Kuantitas baru harus berupa angka.'),
    body('reason').trim().notEmpty().withMessage('Alasan penyesuaian tidak boleh kosong.'),
    body('uomId').isInt({ min: 1 }).withMessage('ID Satuan Unit tidak valid.')
];

module.exports = { 
    createLotRules,
    adjustStockRules // Ekspor aturan baru
};
