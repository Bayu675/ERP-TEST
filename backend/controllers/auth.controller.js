// File: controllers/auth.controller.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.users;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.login = catchAsync(async (req, res, next) => {
  // KODE VALIDASI MANUAL DI BAWAH INI SUDAH TIDAK DIPERLUKAN LAGI
  // if (!username || !password) {
  //   return next(new AppError('Username dan password harus diisi.', 400));
  // }
  // Validasi sudah ditangani oleh express-validator.

  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !isPasswordCorrect) {
    return next(new AppError('Username atau password salah.', 401));
  }

  if (user.status !== 'active') {
    return next(new AppError('Akun Anda tidak aktif. Silakan hubungi administrator.', 403));
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  res.status(200).json({
    status: 'success',
    message: 'Login berhasil.',
    token: token,
  });
});
