// File: validators/paymentTerm.validator.js (BARU)
'use strict';
const { body } = require('express-validator');

const paymentTermRules = [
  body('name').trim().notEmpty().withMessage('Nama syarat pembayaran tidak boleh kosong.'),
  body('downPaymentPercentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Persentase DP harus berupa angka antara 0 dan 100.'),
];

module.exports = {
  paymentTermRules,
};