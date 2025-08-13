// File: routes/inventory.routes.js

'use strict';
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { createLotRules, adjustStockRules } = require('../validators/inventory.validator');
const validate = require('../middlewares/validation.middleware');

const canManageInventory = authorize('admin', 'staff');

// Rute yang sudah ada untuk membuat lot
router.post('/inventory/lots', authenticateToken, canManageInventory, createLotRules, validate, inventoryController.createInventoryLot);
router.get('/products/:productId/inventory', authenticateToken, canManageInventory, inventoryController.getProductInventory);

// --- RUTE BARU UNTUK MENDAPATKAN DETAIL INVENTARIS ---
router.get(
    '/products/:productId/inventory', 
    authenticateToken, 
    canManageInventory, 
    inventoryController.getProductInventory
);

// --- RUTE BARU UNTUK PENYESUAIAN STOK ---
router.post(
    '/products/:productId/inventory/adjust',
    authenticateToken,
    canManageInventory,
    adjustStockRules, // Terapkan validator baru
    validate,
    inventoryController.adjustStock
);
module.exports = router;
