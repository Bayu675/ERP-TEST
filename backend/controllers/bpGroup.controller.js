// File: controllers/bpGroup.controller.js (Refactored)

'use strict';
const db = require('../models');
const BusinessPartnerGroup = db.BusinessPartnerGroup; // Menggunakan nama model yang konsisten
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Membuat grup baru
exports.createGroup = catchAsync(async (req, res, next) => {
  const newGroup = await BusinessPartnerGroup.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      group: newGroup,
    },
  });
});

// Mendapatkan semua grup
exports.getAllGroups = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(BusinessPartnerGroup, req.query).sort().paginate();
  const { count, rows } = await BusinessPartnerGroup.findAndCountAll(features.queryOptions);

  res.status(200).json({
    status: 'success',
    total: count,
    results: rows.length,
    data: {
      groups: rows,
    },
  });
});

// Mendapatkan satu grup spesifik
exports.getGroup = catchAsync(async (req, res, next) => {
  const group = await BusinessPartnerGroup.findByPk(req.params.id);
  if (!group) {
    return next(new AppError('Grup mitra bisnis dengan ID tersebut tidak ditemukan', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      group,
    },
  });
});

// Mengupdate grup
exports.updateGroup = catchAsync(async (req, res, next) => {
  const [updated] = await BusinessPartnerGroup.update(req.body, {
    where: { id: req.params.id },
  });

  if (updated === 0) {
    return next(new AppError('Grup mitra bisnis dengan ID tersebut tidak ditemukan', 404));
  }

  const updatedGroup = await BusinessPartnerGroup.findByPk(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      group: updatedGroup,
    },
  });
});

// Menghapus grup
exports.deleteGroup = catchAsync(async (req, res, next) => {
  const deleted = await BusinessPartnerGroup.destroy({
    where: { id: req.params.id },
  });

  if (deleted === 0) {
    return next(new AppError('Grup mitra bisnis dengan ID tersebut tidak ditemukan', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});