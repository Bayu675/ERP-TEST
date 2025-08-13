// File: controllers/masterData.controller.js
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');


// Fungsi generik untuk membuat controller CRUD
const createCrudController = (modelName) => {
  const Model = db[modelName];
  return {
    create: catchAsync(async (req, res, next) => {
      const record = await Model.create(req.body);
      res.status(201).json({ status: 'success', data: record });
    }),
    getAll: catchAsync(async (req, res, next) => {
      const features = new APIFeatures(Model, req.query).filter().sort().paginate();
      const { count, rows } = await Model.findAndCountAll(features.queryOptions);
      res.status(200).json({ status: 'success', total: count, results: rows.length, data: rows });
    }),
    getOne: catchAsync(async (req, res, next) => {
      const record = await Model.findByPk(req.params.id);
      if (!record) return next(new AppError('Data tidak ditemukan', 404));
      res.status(200).json({ status: 'success', data: record });
    }),
    update: catchAsync(async (req, res, next) => {
      const [updated] = await Model.update(req.body, { where: { id: req.params.id } });
      if (updated === 0) return next(new AppError('Data tidak ditemukan', 404));
      const updatedRecord = await Model.findByPk(req.params.id);
      res.status(200).json({ status: 'success', data: updatedRecord });
    }),
    delete: catchAsync(async (req, res, next) => {
      const deleted = await Model.destroy({ where: { id: req.params.id } });
      if (deleted === 0) return next(new AppError('Data tidak ditemukan', 404));
      res.status(204).json({ status: 'success', data: null });
    }),
  };
};

// Controller CRUD lengkap untuk BusinessPartnerGroup
const BpGroup = db.BusinessPartnerGroup;
exports.bpGroups = {
    create: catchAsync(async (req, res) => {
        const group = await BpGroup.create(req.body);
        res.status(201).json({ status: 'success', data: { group } });
    }),
    getAll: catchAsync(async (req, res) => {
        const groups = await BpGroup.findAll({ order: [['name', 'ASC']] });
        res.status(200).json({ status: 'success', data: { groups } });
    }),
    getOne: catchAsync(async (req, res, next) => {
        const group = await BpGroup.findByPk(req.params.id);
        if (!group) return next(new AppError('Grup tidak ditemukan', 404));
        res.status(200).json({ status: 'success', data: { group } });
    }),
    update: catchAsync(async (req, res, next) => {
        const [updated] = await BpGroup.update(req.body, { where: { id: req.params.id } });
        if (updated === 0) return next(new AppError('Grup tidak ditemukan', 404));
        const updatedGroup = await BpGroup.findByPk(req.params.id);
        res.status(200).json({ status: 'success', data: { group: updatedGroup } });
    }),
    delete: catchAsync(async (req, res, next) => {
        const deleted = await BpGroup.destroy({ where: { id: req.params.id } });
        if (deleted === 0) return next(new AppError('Grup tidak ditemukan', 404));
        res.status(204).json({ status: 'success', data: null });
    }),
};

// Ekspor controller untuk setiap model
module.exports = {
  categories: createCrudController('ProductCategory'),
  uoms: createCrudController('UnitOfMeasure'),
  taxes: createCrudController('Tax'),
  bpGroups: require('./bpGroup.controller') 
};

// Ekspor fungsi createCrudController agar bisa digunakan di file lain
module.exports = {
  createCrudController, // Tambahkan baris ini
  categories: createCrudController('ProductCategory'),
  uoms: createCrudController('UnitOfMeasure'),
  taxes: createCrudController('Tax'),
  bpGroups: require('./bpGroup.controller') 
};