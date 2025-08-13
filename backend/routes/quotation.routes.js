// File: routes/quotation.routes.js (UPDATE)
'use strict';
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
// Impor kedua set aturan
const { quotationRules, updateQuotationRules } = require('../validators/quotation.validator');
const validate = require('../middlewares/validation.middleware');

const canManageQuotations = authorize('admin', 'staff', 'sales');

// Gunakan aturan ketat untuk membuat
router.route('/')
    .post(authenticateToken, canManageQuotations, quotationRules, validate, quotationController.createQuotation)
    .get(authenticateToken, canManageQuotations, quotationController.getAllQuotations);

// Gunakan aturan fleksibel untuk mengupdate
router.route('/:id')
    .get(authenticateToken, canManageQuotations, quotationController.getQuotation)
    .put(authenticateToken, canManageQuotations, updateQuotationRules, validate, quotationController.updateQuotation)
    .delete(authenticateToken, canManageQuotations, quotationController.deleteQuotation);

// Rute konversi tidak perlu validasi body
router.post(
    '/:id/convert-to-so',
    authenticateToken,
    canManageQuotations,
    quotationController.convertQuotationToSalesOrder
);

module.exports = router;
