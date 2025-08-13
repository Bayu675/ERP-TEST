// File: utils/appError.js
// Kelas ini digunakan untuk membuat error operasional yang kita tahu bisa terjadi.

class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
  
      this.statusCode = statusCode;
      // Menentukan status 'fail' untuk 4xx atau 'error' untuk 5xx
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      // Menandai ini sebagai error operasional, bukan bug programming
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;
  