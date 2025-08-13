// File: routes/variant.routes.js (BARU)
// Rute untuk mengelola varian produk.

const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variant.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { variantRules } = require('../validators/variant.validator');
const validate = require('../middlewares/validation.middleware');

// Otorisasi: Siapa yang boleh mengelola varian?
const canManageVariants = authorize('admin', 'staff');

// Rute yang di-nest di bawah produk
// Contoh: /api/products/PRODUCT_ID/variants
router.route('/products/:productId/variants')
  .post(authenticateToken, canManageVariants, variantRules, validate, variantController.createVariant)
  .get(authenticateToken, variantController.getAllVariantsForProduct);

// Rute untuk mengelola varian secara individual
// Contoh: /api/variants/VARIANT_ID
router.route('/variants/:variantId')
  .get(authenticateToken, variantController.getVariant)
  .put(authenticateToken, canManageVariants, variantRules, validate, variantController.updateVariant)
  .delete(authenticateToken, canManageVariants, variantController.deleteVariant);

module.exports = router;
