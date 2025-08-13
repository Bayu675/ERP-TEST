// File: controllers/attribute.controller.js (BARU)
// Controller untuk mengelola ProductAttribute dan AttributeValue.

const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const ProductAttribute = db.ProductAttribute;
const AttributeValue = db.AttributeValue;

// --- Controller untuk ProductAttribute ---

exports.createAttribute = catchAsync(async (req, res, next) => {
  const attribute = await ProductAttribute.create(req.body);
  res.status(201).json({ status: 'success', data: { attribute } });
});

exports.getAllAttributes = catchAsync(async (req, res, next) => {
  // Tampilkan juga nilai-nilai yang dimiliki setiap atribut
  const features = new APIFeatures(ProductAttribute, req.query).filter().sort().paginate();
  features.queryOptions.include = { model: db.AttributeValue, as: 'values' };

  const { count, rows } = await ProductAttribute.findAndCountAll(features.queryOptions);
  res.status(200).json({ status: 'success', total: count, results: rows.length, data: { attributes: rows } });
});

exports.getAttribute = catchAsync(async (req, res, next) => {
  const attribute = await ProductAttribute.findByPk(req.params.id, {
    include: { model: db.AttributeValue, as: 'values' }
  });
  if (!attribute) {
    return next(new AppError('Atribut dengan ID tersebut tidak ditemukan', 404));
  }
  res.status(200).json({ status: 'success', data: { attribute } });
});

exports.updateAttribute = catchAsync(async (req, res, next) => {
  const [updated] = await ProductAttribute.update(req.body, { where: { id: req.params.id } });
  if (updated === 0) {
    return next(new AppError('Atribut dengan ID tersebut tidak ditemukan', 404));
  }
  const updatedAttribute = await ProductAttribute.findByPk(req.params.id);
  res.status(200).json({ status: 'success', data: { attribute: updatedAttribute } });
});

exports.deleteAttribute = catchAsync(async (req, res, next) => {
  const deleted = await ProductAttribute.destroy({ where: { id: req.params.id } });
  if (deleted === 0) {
    return next(new AppError('Atribut dengan ID tersebut tidak ditemukan', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});


// --- Controller untuk AttributeValue ---

exports.createAttributeValue = catchAsync(async (req, res, next) => {
  // Pastikan nilai dibuat untuk atribut yang ada
  const attributeId = req.params.attributeId;
  const attribute = await ProductAttribute.findByPk(attributeId);
  if (!attribute) {
    return next(new AppError('Atribut induk dengan ID tersebut tidak ditemukan', 404));
  }

  const newValue = await AttributeValue.create({
    value: req.body.value,
    attributeId: attributeId,
  });
  res.status(201).json({ status: 'success', data: { value: newValue } });
});

exports.updateAttributeValue = catchAsync(async (req, res, next) => {
    const [updated] = await AttributeValue.update(req.body, { where: { id: req.params.valueId } });
    if (updated === 0) {
        return next(new AppError('Nilai atribut dengan ID tersebut tidak ditemukan', 404));
    }
    const updatedValue = await AttributeValue.findByPk(req.params.valueId);
    res.status(200).json({ status: 'success', data: { value: updatedValue } });
});

exports.deleteAttributeValue = catchAsync(async (req, res, next) => {
    const deleted = await AttributeValue.destroy({ where: { id: req.params.valueId } });
    if (deleted === 0) {
        return next(new AppError('Nilai atribut dengan ID tersebut tidak ditemukan', 404));
    }
    res.status(204).json({ status: 'success', data: null });
});