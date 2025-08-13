// File: controllers/product.controller.js (dengan Logika Re-aktivasi SKU)

const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { Sequelize } = require('sequelize');

const Product = db.Product;

const includeRelations = [
    { model: db.ProductCategory, as: 'category' },
    { model: db.SubCategory, as: 'subcategory' },
    { model: db.Brand, as: 'brand' },
    { model: db.UnitOfMeasure, as: 'uom' },
    { model: db.Tax, as: 'tax' },
];

// --- FUNGSI INI TELAH DIPERBARUI SECARA SIGNIFIKAN ---
exports.createProduct = catchAsync(async (req, res, next) => {
  const createOrUpdate = async (productData, existingProduct = null) => {
    if (existingProduct) {
      // Update produk yang diarsipkan
      return await existingProduct.update({ ...productData, status: 'ACTIVE' });
    } else {
      // Buat produk baru
      return await Product.create(productData);
    }
  };

  try {
    const existingProduct = await Product.findOne({ where: { sku: req.body.sku } });

    if (existingProduct && existingProduct.status !== 'ARCHIVED') {
      return next(new AppError('SKU yang Anda masukkan sudah digunakan oleh produk lain yang aktif.', 400));
    }

    const newOrUpdatedProduct = await createOrUpdate(req.body, existingProduct);

    // Ambil kembali data lengkap dengan semua relasi
    const fullProductData = await Product.findByPk(newOrUpdatedProduct.id, {
      include: includeRelations
    });

    res.status(existingProduct ? 200 : 201).json({
      status: 'success',
      message: existingProduct ? 'Produk yang diarsipkan telah diaktifkan kembali.' : 'Produk berhasil dibuat.',
      data: { product: fullProductData }
    });

  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
       return next(new AppError('Terjadi kesalahan data unik. Harap periksa kembali input Anda.', 400));
    }
    next(error);
  }
});

// ... (sisa fungsi controller tidak berubah)
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.status !== 'all') {
    filter.status = { [Sequelize.Op.ne]: 'ARCHIVED' }; // Jangan tampilkan yang diarsipkan secara default
  }
  req.query = { ...filter, ...req.query };

  const features = new APIFeatures(Product, req.query).filter().sort().paginate();
  features.queryOptions.include = includeRelations;

  const { count, rows } = await Product.findAndCountAll(features.queryOptions);

  res.status(200).json({
    status: 'success',
    total: count,
    results: rows.length,
    data: { products: rows },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, {
    include: includeRelations
  });

  if (!product) {
    return next(new AppError('Produk dengan ID tersebut tidak ditemukan', 404));
  }
  
  if (product.status === 'ARCHIVED' && req.query.status !== 'all') {
      return next(new AppError('Produk dengan ID tersebut tidak ditemukan atau sudah diarsipkan', 404));
  }

  res.status(200).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const [updated] = await Product.update(req.body, {
    where: { id: req.params.id }
  });

  if (updated === 0) {
    return next(new AppError('Produk dengan ID tersebut tidak ditemukan', 404));
  }

  const updatedProduct = await Product.findByPk(req.params.id, { include: includeRelations });
  res.status(200).json({ status: 'success', data: { product: updatedProduct } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const [updated] = await Product.update({ status: 'ARCHIVED' }, {
    where: { id: req.params.id }
  });

  if (updated === 0) {
    return next(new AppError('Produk dengan ID tersebut tidak ditemukan', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
