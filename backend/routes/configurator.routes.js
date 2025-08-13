// File: backend/routes/configurator.routes.js (BARU)
'use strict';
const express = require('express');
const router = express.Router();
const configuratorController = require('../controllers/configurator.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');

const isAdmin = authorize('admin');

// Rute untuk mengelola template
router.route('/config_templates')
    .get(authenticateToken, configuratorController.getAllTemplates)
    .post(authenticateToken, isAdmin, configuratorController.createTemplate);

// Rute untuk mengelola versi
router.route('/config_templates/:templateId/versions')
    .post(authenticateToken, isAdmin, configuratorController.createTemplateVersion);

router.route('/template_versions/:versionId')
    .get(authenticateToken, configuratorController.getTemplateVersion);

// Rute untuk menjalankan kalkulasi preview
router.post('/configurator/compute', authenticateToken, configuratorController.computePreview);

module.exports = router;
