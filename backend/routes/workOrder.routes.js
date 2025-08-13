// File: routes/workOrder.routes.js (BARU)
'use strict';
const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrder.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');

const canManageWorkOrders = authorize('admin', 'staff');

// Endpoint utama untuk membuat SPK dari sebuah Sales Order
router.post(
    '/sales-orders/:salesOrderId/create-work-order',
    authenticateToken,
    canManageWorkOrders,
    workOrderController.createWorkOrderFromSalesOrder
);

// TODO SELESAI: Tambahkan rute CRUD untuk Work Order jika diperlukan (GET, PUT, DELETE)
router.route('/work-orders')
    .get(authenticateToken, canManageWorkOrders, workOrderController.getAllWorkOrders);

router.route('/work-orders/:id')
    .get(authenticateToken, canManageWorkOrders, workOrderController.getWorkOrder)
    .put(authenticateToken, canManageWorkOrders, workOrderController.updateWorkOrderStatus) // Rute untuk update status
    .delete(authenticateToken, canManageWorkOrders, workOrderController.deleteWorkOrder); // Rute untuk membatalkan

module.exports = router;
