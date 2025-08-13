// File: backend/routes/businessPartnerGroup.routes.js (BARU)

'use strict';
const express = require('express');
const router = express.Router();
const bpGroupController = require('../controllers/bpGroup.controller');
const { authenticateToken, authorize } = require('../middlewares/auth.middleware');
const { bpGroupRules } = require('../validators/bpGroup.validator');
const validate = require('../middlewares/validation.middleware');

const canManageGroups = authorize('admin', 'staff');

router.route('/')
    .get(authenticateToken, bpGroupController.getAllGroups)
    .post(authenticateToken, canManageGroups, bpGroupRules, validate, bpGroupController.createGroup);

router.route('/:id')
    .get(authenticateToken, bpGroupController.getGroup)
    .put(authenticateToken, canManageGroups, bpGroupRules, validate, bpGroupController.updateGroup)
    .delete(authenticateToken, canManageGroups, bpGroupController.deleteGroup);

module.exports = router;