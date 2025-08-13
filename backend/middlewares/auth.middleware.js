// File: middlewares/auth.middleware.js
// Middleware untuk otentikasi (verifikasi token) dan otorisasi (cek peran).

const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.users;
const AppError = require('../utils/appError');

/**
 * Memverifikasi token JWT dari header.
 * Jika valid, melampirkan data user ke req.user.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Akses ditolak. Token tidak ditemukan.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new AppError('User yang terkait dengan token ini tidak lagi ada.', 401));
    }
    
    if (user.status !== 'active') {
        return next(new AppError('Akun Anda tidak aktif.', 401));
    }

    req.user = user; // Melampirkan user ke request
    next();
  } catch (error) {
    // Menangani error token yang tidak valid atau kedaluwarsa
    return next(new AppError('Token tidak valid atau telah kedaluwarsa. Silakan login kembali.', 401));
  }
};

/**
 * Middleware otorisasi berbasis peran (RBAC).
 * Hanya mengizinkan akses jika peran user termasuk dalam daftar peran yang diizinkan.
 * @param  {...string} roles - Daftar peran yang diizinkan (misal: 'admin', 'staff').
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Middleware ini harus dijalankan SETELAH authenticateToken,
    // sehingga kita memiliki akses ke req.user.
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Anda tidak memiliki izin untuk melakukan aksi ini.', 403) // 403 Forbidden
      );
    }
    next();
  };
};


module.exports = {
  authenticateToken,
  authorize, // Ekspor middleware baru
};
