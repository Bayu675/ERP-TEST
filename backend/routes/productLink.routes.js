// File: backend/routes/productLink.routes.js (BARU)
'use strict';
const express = require('express');
const router = express.Router();
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.get('/product-links', authenticateToken, catchAsync(async (req, res) => {
    const links = await db.ProductLink.findAll();
    res.status(200).json({ status: 'success', data: { links } });
}));

module.exports = router;