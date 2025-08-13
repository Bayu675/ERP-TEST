// File: routes/businessPartner.routes.js (UPDATE)
// Sekarang kita akan menggunakan aturan validasi yang tepat untuk setiap rute.

const express = require('express');
const router = express.Router();
const bpController = require('../controllers/businessPartner.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
// Impor kedua set aturan
const { createPartnerRules, updatePartnerRules } = require('../validators/businessPartner.validator');
const validate = require('../middlewares/validation.middleware');

const canManagePartners = authorize('admin', 'staff');

router.route('/')
  // Gunakan aturan KETAT saat membuat
  .post(authenticateToken, canManagePartners, createPartnerRules, validate, bpController.createPartner)
  .get(authenticateToken, bpController.getAllPartners);

router.route('/:id')
  .get(authenticateToken, bpController.getPartner)
  // Gunakan aturan FLEKSIBEL saat mengupdate
  .put(authenticateToken, canManagePartners, updatePartnerRules, validate, bpController.updatePartner)
  .delete(authenticateToken, canManagePartners, bpController.deletePartner);

module.exports = router;