// File: validators/businessPartner.validator.js (dengan Validasi Salesman)
'use strict';
const { body } = require('express-validator');

// Aturan ketat untuk MEMBUAT mitra bisnis baru
const createPartnerRules = [
  body('name').trim().notEmpty().withMessage('Nama mitra bisnis tidak boleh kosong.'),
  body('partnerGroupId').isInt({ min: 1 }).withMessage('Grup mitra bisnis harus dipilih.'),
  
  // --- TAMBAHKAN ATURAN BARU INI ---
  body('salespersonId').notEmpty().withMessage('Salesman penanggung jawab harus dipilih.').isUUID().withMessage('ID Salesman tidak valid.'),
  // --- AKHIR PENAMBAHAN ---

  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Format email tidak valid.'),
  body('paymentTerm').optional().isInt({ min: 0 }).withMessage('Termin pembayaran harus berupa angka.'),
];

// Aturan fleksibel untuk MENGUPDATE mitra bisnis
const updatePartnerRules = [
  body('name').optional().trim().notEmpty().withMessage('Nama mitra bisnis tidak boleh kosong.'),
  body('partnerGroupId').optional().isInt({ min: 1 }).withMessage('Grup mitra bisnis harus dipilih.'),
  
  // --- TAMBAHKAN ATURAN BARU INI ---
  body('salespersonId').optional().isUUID().withMessage('ID Salesman tidak valid.'),
  // --- AKHIR PENAMBAHAN ---

  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Format email tidak valid.'),
  body('paymentTerm').optional().isInt({ min: 0 }).withMessage('Termin pembayaran harus berupa angka.'),
];

module.exports = {
  createPartnerRules,
  updatePartnerRules,
};
