// File: validators/configuration.validator.js (BARU)
const { body } = require('express-validator');

const priceConfigRules = [
  body('combination').isArray({ min: 1 }).withMessage('Kombinasi atribut harus berupa array dan tidak boleh kosong.'),
  body('pricePerSquareMeter').isDecimal({ decimal_digits: '2' }).withMessage('Harga harus berupa angka desimal.'),
  body('minCalculationWidth').optional().isFloat({ min: 0 }).withMessage('Lebar minimal harus angka.'),
  body('minCalculationHeight').optional().isFloat({ min: 0 }).withMessage('Tinggi minimal harus angka.'),
];

const bomRules = [
  body('name').trim().notEmpty().withMessage('Nama BOM tidak boleh kosong.'),
  body('combination').isArray({ min: 1 }).withMessage('Kombinasi atribut harus berupa array dan tidak boleh kosong.'),
  body('items').isArray({ min: 1 }).withMessage('BOM harus memiliki minimal satu komponen.'),
  body('items.*.componentId').isUUID().withMessage('ID Komponen tidak valid.'),
  body('items.*.quantityFormula').trim().notEmpty().withMessage('Rumus kuantitas tidak boleh kosong.'),
];

module.exports = {
  priceConfigRules,
  bomRules,
};