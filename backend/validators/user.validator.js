// File: validators/user.validator.js
// Berisi aturan validasi untuk rute yang berhubungan dengan manajemen user.

const { body } = require('express-validator');

const createUserRules = [
  // username tidak boleh kosong dan minimal 3 karakter
  body('username')
    .trim()
    .notEmpty().withMessage('Username tidak boleh kosong.')
    .isLength({ min: 3 }).withMessage('Username harus memiliki minimal 3 karakter.'),

  // password minimal 6 karakter
  body('password')
    .isLength({ min: 6 }).withMessage('Password harus memiliki minimal 6 karakter.'),

  // role harus salah satu dari nilai yang diizinkan jika ada
  body('role')
    .optional() // Role tidak wajib diisi
    .isIn(['admin', 'staff', 'sales']).withMessage("Role tidak valid. Pilih 'admin', 'staff', atau 'sales'."),
];

module.exports = {
  createUserRules,
};
