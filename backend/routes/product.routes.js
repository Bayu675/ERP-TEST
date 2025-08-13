// File: routes/product.routes.js (BARU)
// URL endpoint untuk API produk.

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
// Impor kedua set aturan validasi
const { createProductRules, updateProductRules } = require('../validators/product.validator');
const validate = require('../middlewares/validation.middleware');

// Otorisasi: Siapa yang boleh mengelola produk? (misal: admin & staff gudang)
const canManageProducts = authorize('admin', 'staff');

// Rute untuk /api/products
router.route('/')
  // Gunakan aturan ketat untuk membuat
  .post(authenticateToken, canManageProducts, createProductRules, validate, productController.createProduct)
  .get(authenticateToken, productController.getAllProducts);

// Rute untuk /api/products/:id
router.route('/:id')
  .get(authenticateToken, productController.getProduct)
  // Gunakan aturan fleksibel untuk mengupdate
  .put(authenticateToken, canManageProducts, updateProductRules, validate, productController.updateProduct)
  .delete(authenticateToken, canManageProducts, productController.deleteProduct);

module.exports = router;