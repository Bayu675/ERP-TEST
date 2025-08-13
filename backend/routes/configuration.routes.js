// File: routes/configuration.routes.js (BARU)
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configuration.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { priceConfigRules, bomRules } = require('../validators/configuration.validator');
const validate = require('../middlewares/validation.middleware');

const canManageConfigs = authorize('admin', 'staff');

// --- Rute untuk PriceConfiguration ---
router.route('/products/:productId/price-configs')
  .post(authenticateToken, canManageConfigs, priceConfigRules, validate, configController.createPriceConfiguration)
  .get(authenticateToken, canManageConfigs, configController.getAllPriceConfigurations);

router.delete('/price-configs/:configId', authenticateToken, canManageConfigs, configController.deletePriceConfiguration);

// --- Rute untuk Bill of Material ---
router.route('/products/:productId/boms')
  .post(authenticateToken, canManageConfigs, bomRules, validate, configController.createBom)
  .get(authenticateToken, canManageConfigs, configController.getAllBoms);

router.delete('/boms/:bomId', authenticateToken, canManageConfigs, configController.deleteBom);

module.exports = router;