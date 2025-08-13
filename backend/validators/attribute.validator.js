// File: validators/attribute.validator.js (BARU)
// Aturan validasi untuk atribut dan nilainya.

const { body } = require('express-validator');

const attributeRules = [
  body('name').trim().notEmpty().withMessage('Nama atribut tidak boleh kosong.'),
];

const attributeValueRules = [
  body('value').trim().notEmpty().withMessage('Nilai atribut tidak boleh kosong.'),
];

module.exports = {
  attributeRules,
  attributeValueRules,
};