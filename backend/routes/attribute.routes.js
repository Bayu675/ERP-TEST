// File: routes/attribute.routes.js (BARU)
// Rute untuk mengelola atribut dan nilai-nilainya.

const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attribute.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { attributeRules, attributeValueRules } = require('../validators/attribute.validator');
const validate = require('../middlewares/validation.middleware');

// Otorisasi: Siapa yang boleh mengelola atribut?
const canManageAttributes = authorize('admin', 'staff');

// --- Rute untuk ProductAttribute ---
router.route('/attributes')
  .post(authenticateToken, canManageAttributes, attributeRules, validate, attributeController.createAttribute)
  .get(authenticateToken, attributeController.getAllAttributes);

router.route('/attributes/:id')
  .get(authenticateToken, attributeController.getAttribute)
  .put(authenticateToken, canManageAttributes, attributeRules, validate, attributeController.updateAttribute)
  .delete(authenticateToken, canManageAttributes, attributeController.deleteAttribute);

// --- Rute untuk AttributeValue ---

// Membuat nilai baru untuk atribut spesifik
router.post(
  '/attributes/:attributeId/values',
  authenticateToken,
  canManageAttributes,
  attributeValueRules,
  validate,
  attributeController.createAttributeValue
);

// Mengupdate dan menghapus nilai atribut spesifik
router.route('/attribute-values/:valueId')
    .put(authenticateToken, canManageAttributes, attributeValueRules, validate, attributeController.updateAttributeValue)
    .delete(authenticateToken, canManageAttributes, attributeController.deleteAttributeValue);


module.exports = router;