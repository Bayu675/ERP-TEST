// File: controllers/businessPartner.controller.js (Memperbaiki Pengambilan Data Diskon)
'use strict';
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const BusinessPartner = db.BusinessPartner;
const BusinessPartnerGroup = db.BusinessPartnerGroup;
const User = db.User;

exports.createPartner = catchAsync(async (req, res, next) => {
  const partner = await BusinessPartner.create(req.body);
  res.status(201).json({ status: 'success', data: { partner } });
});

exports.getAllPartners = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.status !== 'all') {
    filter.status = 'ACTIVE';
  }
  req.query = { ...filter, ...req.query };

  const features = new APIFeatures(BusinessPartner, req.query)
    .filter()
    .sort()
    .paginate();

  // --- PERBAIKAN DI SINI: Tambahkan 'defaultDiscount' ---
  features.queryOptions.include = [
    {
      model: BusinessPartnerGroup,
      as: 'group',
      attributes: ['id', 'name', 'defaultDiscount'] // Ambil juga data diskon
    },
    {
      model: User,
      as: 'salesperson',
      attributes: ['id', 'username']
    }
  ];

  const { count, rows } = await BusinessPartner.findAndCountAll(features.queryOptions);

  res.status(200).json({
    status: 'success',
    total: count,
    results: rows.length,
    data: { partners: rows }
  });
});

exports.getPartner = catchAsync(async (req, res, next) => {
  const whereCondition = { id: req.params.id };
  if (req.query.status !== 'all') {
    whereCondition.status = 'ACTIVE';
  }

  // --- PERBAIKAN DI SINI: Tambahkan 'defaultDiscount' ---
  const partner = await BusinessPartner.findOne({
    where: whereCondition,
    include: [
        { model: BusinessPartnerGroup, as: 'group', attributes: ['id', 'name', 'defaultDiscount'] },
        { model: User, as: 'salesperson', attributes: ['id', 'username'] }
    ]
  });

  if (!partner) {
    return next(new AppError('Mitra bisnis tidak ditemukan atau sudah diarsipkan', 404));
  }

  res.status(200).json({ status: 'success', data: { partner } });
});

exports.updatePartner = catchAsync(async (req, res, next) => {
  const [updated] = await BusinessPartner.update(req.body, { where: { id: req.params.id } });
  if (updated === 0) {
    return next(new AppError('Mitra bisnis tidak ditemukan', 404));
  }

  // --- PERBAIKAN DI SINI: Tambahkan 'defaultDiscount' ---
  const updatedPartner = await BusinessPartner.findByPk(req.params.id, {
    include: [
        { model: BusinessPartnerGroup, as: 'group', attributes: ['id', 'name', 'defaultDiscount'] },
        { model: User, as: 'salesperson', attributes: ['id', 'username'] }
    ]
  });

  res.status(200).json({ status: 'success', data: { partner: updatedPartner } });
});

exports.deletePartner = catchAsync(async (req, res, next) => {
  const [updated] = await BusinessPartner.update(
    { status: 'ARCHIVED' },
    { where: { id: req.params.id } }
  );

  if (updated === 0) {
    return next(new AppError('Mitra bisnis tidak ditemukan', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
