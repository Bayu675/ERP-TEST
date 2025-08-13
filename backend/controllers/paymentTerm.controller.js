// File: controllers/paymentTerm.controller.js (BARU)
'use strict';
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const PaymentTerm = db.PaymentTerm;

exports.createPaymentTerm = catchAsync(async (req, res, next) => {
  const paymentTerm = await PaymentTerm.create(req.body);
  res.status(201).json({ status: 'success', data: { paymentTerm } });
});

exports.getAllPaymentTerms = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(PaymentTerm, req.query).filter().sort().paginate();
  const { count, rows } = await PaymentTerm.findAndCountAll(features.queryOptions);
  res.status(200).json({ status: 'success', total: count, results: rows.length, data: { paymentTerms: rows } });
});

exports.getPaymentTerm = catchAsync(async (req, res, next) => {
  const paymentTerm = await PaymentTerm.findByPk(req.params.id);
  if (!paymentTerm) {
    return next(new AppError('Syarat pembayaran tidak ditemukan', 404));
  }
  res.status(200).json({ status: 'success', data: { paymentTerm } });
});

exports.updatePaymentTerm = catchAsync(async (req, res, next) => {
  const [updated] = await PaymentTerm.update(req.body, { where: { id: req.params.id } });
  if (updated === 0) {
    return next(new AppError('Syarat pembayaran tidak ditemukan', 404));
  }
  const updatedPaymentTerm = await PaymentTerm.findByPk(req.params.id);
  res.status(200).json({ status: 'success', data: { paymentTerm: updatedPaymentTerm } });
});

exports.deletePaymentTerm = catchAsync(async (req, res, next) => {
  const deleted = await PaymentTerm.destroy({ where: { id: req.params.id } });
  if (deleted === 0) {
    return next(new AppError('Syarat pembayaran tidak ditemukan', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});