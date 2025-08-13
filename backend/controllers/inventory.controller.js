// File: controllers/inventory.controller.js

'use strict';
const db = require('../models');
const catchAsync = require('../utils/catchAsync');

// ... (fungsi createInventoryLot yang sudah ada)
exports.createInventoryLot = catchAsync(async (req, res, next) => {
  const lot = await db.InventoryLot.create({
    ...req.body,
    currentQuantity: req.body.initialQuantity
  });
  res.status(201).json({ status: 'success', data: { lot } });
});


// --- FUNGSI BARU UNTUK MENGAMBIL DATA INVENTARIS ---
exports.getProductInventory = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  // 1. Hitung total stok saat ini dari semua lot
  const totalStock = await db.InventoryLot.sum('currentQuantity', {
    where: { productId: productId }
  });

  // 2. Ambil semua lot/batch inventaris untuk produk ini
  const lots = await db.InventoryLot.findAll({
    where: { productId: productId },
    order: [['receivedDate', 'DESC']] // Tampilkan yang terbaru di atas
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalStock: totalStock || 0, // Kirim 0 jika hasilnya null
      lots: lots
    }
  });
});

// --- FUNGSI BARU UNTUK MENGAMBIL DATA INVENTARIS ---
exports.getProductInventory = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  // 1. Hitung total stok saat ini dari semua lot
  const totalStock = await db.InventoryLot.sum('currentQuantity', {
    where: { productId: productId }
  });

  // 2. Ambil semua lot/batch inventaris untuk produk ini
  const lots = await db.InventoryLot.findAll({
    where: { productId: productId },
    order: [['receivedDate', 'DESC']] // Tampilkan yang terbaru di atas
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalStock: totalStock || 0, // Kirim 0 jika hasilnya null
      lots: lots
    }
  });
});

// --- FUNGSI BARU UNTUK PENYESUAIAN STOK ---
exports.adjustStock = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { newTotalQuantity, reason, uomId } = req.body;

  // 1. Hitung total stok saat ini
  const currentTotalStock = await db.InventoryLot.sum('currentQuantity', {
      where: { productId: productId }
  }) || 0;

  // 2. Hitung selisih penyesuaian
  const adjustmentQuantity = newTotalQuantity - currentTotalStock;

  if (adjustmentQuantity === 0) {
      return next(new AppError('Kuantitas baru sama dengan kuantitas saat ini. Tidak ada penyesuaian yang dilakukan.', 400));
  }

  // 3. Buat lot baru untuk mencatat transaksi penyesuaian
  const adjustmentLot = await db.InventoryLot.create({
      productId: productId,
      lotNumber: `ADJ-${new Date().toISOString()}`, // Nomor lot unik untuk penyesuaian
      initialQuantity: adjustmentQuantity, // Bisa positif atau negatif
      currentQuantity: adjustmentQuantity,
      uomId: uomId,
      receivedDate: new Date(),
      costPerUnit: 0, // Biaya 0 untuk penyesuaian
      notes: reason // Simpan alasan di kolom notes jika ada
  });

  res.status(201).json({
      status: 'success',
      message: 'Stok berhasil disesuaikan.',
      data: { lot: adjustmentLot }
  });
});
