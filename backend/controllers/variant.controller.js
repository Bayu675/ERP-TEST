// File: controllers/variant.controller.js (BARU)
// Controller untuk mengelola ProductVariant.

const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Product = db.Product;
const ProductVariant = db.ProductVariant;
const AttributeValue = db.AttributeValue;

// Membuat varian baru untuk sebuah produk
exports.createVariant = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const { sku, price, attributeValueIds } = req.body;

  // 1. Periksa apakah produk induk ada dan ditandai memiliki varian
  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new AppError('Produk induk dengan ID tersebut tidak ditemukan', 404));
  }
  if (!product.hasVariants) {
    return next(new AppError('Produk ini tidak dikonfigurasi untuk memiliki varian.', 400));
  }

  // Gunakan transaksi untuk memastikan semua operasi berhasil atau tidak sama sekali
  const result = await db.sequelize.transaction(async (t) => {
    // 2. Buat record ProductVariant
    const newVariant = await ProductVariant.create({
      productId,
      sku,
      price,
    }, { transaction: t });

    // 3. Hubungkan varian dengan nilai atribut yang dipilih
    await newVariant.addAttributeValues(attributeValueIds, { transaction: t });

    return newVariant;
  });

  // Ambil kembali data varian yang baru dibuat beserta atributnya untuk ditampilkan
  const completeVariant = await ProductVariant.findByPk(result.id, {
    include: {
        model: AttributeValue,
        as: 'attributes',
        include: 'attribute' // Sertakan juga nama atributnya (misal: "Warna")
    }
  });

  res.status(201).json({ status: 'success', data: { variant: completeVariant } });
});

// Mendapatkan semua varian dari satu produk
exports.getAllVariantsForProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const variants = await ProductVariant.findAll({
    where: { productId },
    include: {
        model: AttributeValue,
        as: 'attributes',
        include: 'attribute'
    }
  });

  res.status(200).json({ status: 'success', results: variants.length, data: { variants } });
});

// Mendapatkan satu varian spesifik
exports.getVariant = catchAsync(async (req, res, next) => {
    const variant = await ProductVariant.findByPk(req.params.variantId, {
        include: {
            model: AttributeValue,
            as: 'attributes',
            include: 'attribute'
        }
    });

    if (!variant) {
        return next(new AppError('Varian produk dengan ID tersebut tidak ditemukan', 404));
    }

    res.status(200).json({ status: 'success', data: { variant } });
});

// Mengupdate varian (hanya SKU dan harga)
exports.updateVariant = catchAsync(async (req, res, next) => {
    // Mengubah atribut dari sebuah varian adalah operasi yang kompleks,
    // jadi untuk saat ini kita hanya fokus pada update SKU dan harga.
    const { sku, price } = req.body;

    const [updated] = await ProductVariant.update({ sku, price }, {
        where: { id: req.params.variantId }
    });

    if (updated === 0) {
        return next(new AppError('Varian produk dengan ID tersebut tidak ditemukan', 404));
    }

    const updatedVariant = await ProductVariant.findByPk(req.params.variantId);
    res.status(200).json({ status: 'success', data: { variant: updatedVariant } });
});

// Menghapus varian
exports.deleteVariant = catchAsync(async (req, res, next) => {
    const deleted = await ProductVariant.destroy({ where: { id: req.params.variantId } });
    if (deleted === 0) {
        return next(new AppError('Varian produk dengan ID tersebut tidak ditemukan', 404));
    }
    res.status(204).json({ status: 'success', data: null });
});