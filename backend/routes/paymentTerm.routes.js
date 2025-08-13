// File: routes/paymentTerm.routes.js (BARU)
'use strict';
const express = require('express');
const router = express.Router();
const paymentTermController = require('../controllers/paymentTerm.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { paymentTermRules } = require('../validators/paymentTerm.validator');
const validate = require('../middlewares/validation.middleware');

const canManagePaymentTerms = authorize('admin'); // Hanya admin yang boleh mengatur syarat pembayaran

router.route('/')
  .post(authenticateToken, canManagePaymentTerms, paymentTermRules, validate, paymentTermController.createPaymentTerm)
  .get(authenticateToken, paymentTermController.getAllPaymentTerms);

router.route('/:id')
  .get(authenticateToken, paymentTermController.getPaymentTerm)
  .put(authenticateToken, canManagePaymentTerms, paymentTermRules, validate, paymentTermController.updatePaymentTerm)
  .delete(authenticateToken, canManagePaymentTerms, paymentTermController.deletePaymentTerm);

module.exports = router;