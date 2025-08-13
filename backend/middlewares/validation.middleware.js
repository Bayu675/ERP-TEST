// File: middlewares/validation.middleware.js
// Middleware untuk memeriksa dan menangani error dari express-validator.

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // Tidak ada error, lanjutkan ke controller
  }

  // Jika ada error, format dan kirim sebagai response
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    status: 'fail',
    message: 'Data yang diberikan tidak valid.',
    errors: extractedErrors,
  });
};

module.exports = validate;
