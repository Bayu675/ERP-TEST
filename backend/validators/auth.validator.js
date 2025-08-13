// File: validators/auth.validator.js
// Berisi aturan validasi untuk rute yang berhubungan dengan otentikasi.

const { body } = require('express-validator');

const loginRules = [
  // username tidak boleh kosong
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username tidak boleh kosong.'),

  // password tidak boleh kosong
  body('password')
    .notEmpty()
    .withMessage('Password tidak boleh kosong.'),
];

module.exports = {
  loginRules,
};
