// File: controllers/configuration.controller.js
// Versi ini diperbaiki untuk menggunakan nama model yang benar.

const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// --- Controller untuk PriceConfiguration ---
exports.createPriceConfiguration = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const { combination, ...priceData } = req.body;
  
  const sortedCombination = combination.sort((a, b) => a - b);

  // PERBAIKAN: Pastikan kita memanggil db.PriceConfiguration
  const newConfig = await db.PriceConfiguration.create({
    productId,
    combination: sortedCombination,
    ...priceData,
  });

  res.status(201).json({ status: 'success', data: { priceConfiguration: newConfig } });
});

exports.getAllPriceConfigurations = catchAsync(async (req, res, next) => {
    const productId = req.params.productId;
    const configs = await db.PriceConfiguration.findAll({ where: { productId } });
    res.status(200).json({ status: 'success', results: configs.length, data: { priceConfigurations: configs } });
});

exports.deletePriceConfiguration = catchAsync(async (req, res, next) => {
    // PERBAIKAN: Menggunakan db.PriceConfiguration
    const deleted = await db.PriceConfiguration.destroy({ where: { id: req.params.configId } });
    if (deleted === 0) return next(new AppError('Konfigurasi harga tidak ditemukan', 404));
    res.status(204).json({ status: 'success', data: null });
});


// --- Controller untuk Bill of Material ---
exports.createBom = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const { name, description, combination, items } = req.body;

  const sortedCombination = combination.sort((a, b) => a - b);

  const result = await db.sequelize.transaction(async (t) => {
    // PERBAIKAN: Pastikan kita memanggil db.BillOfMaterial
    const newBom = await db.BillOfMaterial.create({
      productId,
      name,
      description,
      combination: sortedCombination,
    }, { transaction: t });

    // PERBAIKAN: Pastikan kita memanggil db.BillOfMaterialItem
    const bomItems = items.map(item => ({ ...item, bomId: newBom.id }));
    await db.BillOfMaterialItem.bulkCreate(bomItems, { transaction: t });

    return newBom;
  });

  const completeBom = await db.BillOfMaterial.findByPk(result.id, {
    include: { model: db.BillOfMaterialItem, as: 'items' }
  });

  res.status(201).json({ status: 'success', data: { bom: completeBom } });
});

exports.getAllBoms = catchAsync(async (req, res, next) => {
    const productId = req.params.productId;
    const boms = await db.BillOfMaterial.findAll({ 
        where: { productId },
        include: { model: db.BillOfMaterialItem, as: 'items' }
    });
    res.status(200).json({ status: 'success', results: boms.length, data: { boms } });
});

exports.deleteBom = catchAsync(async (req, res, next) => {
    // PERBAIKAN: Menggunakan db.BillOfMaterial
    const deleted = await db.BillOfMaterial.destroy({ where: { id: req.params.bomId } });
    if (deleted === 0) return next(new AppError('BOM tidak ditemukan', 404));
    res.status(204).json({ status: 'success', data: null });
});
