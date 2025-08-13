// File: backend/controllers/configurator.controller.js (Diperbaiki)
'use strict';
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const { computeConfiguration } = require('../services/configurator.service');

const ConfigTemplate = db.ConfigTemplate;
const TemplateVersion = db.TemplateVersion;

// --- CRUD untuk Template ---
exports.createTemplate = catchAsync(async (req, res, next) => {
    const template = await ConfigTemplate.create(req.body);
    res.status(201).json({ status: 'success', data: { template } });
});

exports.getAllTemplates = catchAsync(async (req, res, next) => {
    const templates = await ConfigTemplate.findAll({ include: 'versions' });
    res.status(200).json({ status: 'success', data: { templates } });
});

// --- CRUD untuk Versi Template ---
exports.createTemplateVersion = catchAsync(async (req, res, next) => {
    const { templateId } = req.params;
    const latestVersion = await TemplateVersion.max('version', { where: { templateId } });
    
    const newVersion = await TemplateVersion.create({
        ...req.body,
        templateId: templateId,
        version: (latestVersion || 0) + 1
    });
    res.status(201).json({ status: 'success', data: { version: newVersion } });
});

exports.getTemplateVersion = catchAsync(async (req, res, next) => {
    const { versionId } = req.params;
    const version = await TemplateVersion.findByPk(versionId);
    res.status(200).json({ status: 'success', data: { version } });
});

// --- Endpoint untuk Kalkulasi ---
exports.computePreview = catchAsync(async (req, res, next) => {
    const { templateVersion, parameterValues } = req.body;
    const result = computeConfiguration(templateVersion, parameterValues);
    res.status(200).json({ status: 'success', data: result });
});
