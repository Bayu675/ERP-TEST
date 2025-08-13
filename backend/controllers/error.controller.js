// File: controllers/error.controller.js

const AppError = require('../utils/appError');
const logger = require('../config/logger'); // Impor logger

// Fungsi untuk menangani error di mode development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Fungsi untuk menangani error di mode production
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Untuk error yang tidak terduga, kita tidak membocorkan detailnya ke klien
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

// Middleware error global
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mencatat error menggunakan Winston
  // Kita log semua level error, baik development maupun production
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  // Untuk development, kita bisa log stack trace juga agar lebih detail
  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  } else {
    sendErrorDev(err, res);
  }
};
