// File: routes/salesOrder.routes.js (BARU)
'use strict';
const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrder.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { updateSalesOrderRules } = require('../validators/salesOrder.validator');
const validate = require('../middlewares/validation.middleware');

const canManageSalesOrders = authorize('admin', 'staff', 'sales', 'supervisor');

// Rute untuk /api/sales-orders
router.route('/')
    .get(authenticateToken, canManageSalesOrders, salesOrderController.getAllSalesOrders);

// Rute untuk /api/sales-orders/:id
router.route('/:id')
    .get(authenticateToken, canManageSalesOrders, salesOrderController.getSalesOrder)
    .put(authenticateToken, canManageSalesOrders, updateSalesOrderRules, validate, salesOrderController.updateSalesOrder)
    .delete(authenticateToken, canManageSalesOrders, salesOrderController.deleteSalesOrder);

module.exports = router;