// File: validators/bpGroup.validator.js (Diskon Diperbaiki)
'use strict';
const { body } = require('express-validator');

const bpGroupRules = [
  body('name').trim().notEmpty().withMessage('Nama grup tidak boleh kosong.'),
  // --- PERBAIKAN DI SINI ---
  // Menggunakan validasi custom untuk memperbolehkan format "10+5" atau "12.5"
  body('defaultDiscount')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9.+%]*$/) // Hanya izinkan angka, titik, plus, dan persen
    .withMessage('Format diskon tidak valid. Gunakan angka, "+", atau "."'),
  // --- AKHIR PERBAIKAN ---
];

module.exports = {
  bpGroupRules,
};
