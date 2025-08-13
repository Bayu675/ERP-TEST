// File: controllers/user.controller.js
// Kontroler untuk mengelola data user, kini dengan fitur API canggih.

const db = require('../models');
const User = db.users;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures'); // Impor APIFeatures

// ... (fungsi createUser, getProfile, getMe tetap sama) ...

exports.createUser = catchAsync(async (req, res, next) => {
  const { username, password, role } = req.body;

  const newUser = await User.create({
    username,
    password,
    role: role || 'user',
  });

  const userResponse = {
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };

  res.status(201).json({
    status: 'success',
    data: {
      user: userResponse,
    },
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  });

// REFAKTOR FUNGSI INI
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // 1) Buat instance APIFeatures
  const features = new APIFeatures(User, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // 2) Eksekusi query menggunakan findAndCountAll
  const { count, rows } = await User.findAndCountAll(features.queryOptions);

  // 3) Kirim respons dengan data dan informasi pagination
  res.status(200).json({
    status: 'success',
    total: count,
    results: rows.length,
    data: {
      users: rows,
    },
  });
});
