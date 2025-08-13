// File: routes/masterData.routes.js (Diperbarui dengan Validator)
const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterData.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');

// Impor semua aturan validasi
const { 
  categoryRules, 
  uomRules, 
  taxRules,
  brandRules,      // Impor baru
  subCategoryRules // Impor baru
} = require('../validators/masterData.validator');

const canManageMasterData = authorize('admin', 'staff');

// --- Rute Kategori Produk ---
router.route('/categories')
  .post(authenticateToken, canManageMasterData, categoryRules, validate, masterDataController.createCrudController('ProductCategory').create)
  .get(authenticateToken, masterDataController.createCrudController('ProductCategory').getAll);

// --- Rute Satuan Unit (UoM) ---
router.route('/uoms')
  .post(authenticateToken, canManageMasterData, uomRules, validate, masterDataController.createCrudController('UnitOfMeasure').create)
  .get(authenticateToken, masterDataController.createCrudController('UnitOfMeasure').getAll);

// --- Rute Pajak (Taxes) ---
router.route('/taxes')
  .post(authenticateToken, canManageMasterData, taxRules, validate, masterDataController.createCrudController('Tax').create)
  .get(authenticateToken, masterDataController.createCrudController('Tax').getAll);

// --- Rute Brand ---
router.route('/brands')
  .post(authenticateToken, canManageMasterData, brandRules, validate, masterDataController.createCrudController('Brand').create)
  .get(authenticateToken, masterDataController.createCrudController('Brand').getAll);

// --- Rute SubCategory ---
router.route('/subcategories')
  .post(authenticateToken, canManageMasterData, subCategoryRules, validate, masterDataController.createCrudController('SubCategory').create)
  .get(authenticateToken, masterDataController.createCrudController('SubCategory').getAll);

module.exports = router;
