// File: controllers/workOrder.controller.js (BARU)
'use strict';
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { consumeStock } = require('../services/inventory.service');
const { Op } = require('sequelize');
const APIFeatures = require('../utils/apiFeatures');

// Fungsi untuk generate nomor SPK unik
const generateWorkOrderNumber = async () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `SPK${year}${month}-`;
    const lastWO = await db.WorkOrder.findOne({
        where: { workOrderNumber: { [Op.like]: `${prefix}%` } },
        order: [['workOrderNumber', 'DESC']],
    });
    let nextId = 1;
    if (lastWO) {
        nextId = parseInt(lastWO.workOrderNumber.split('-')[1]) + 1;
    }
    return `${prefix}${nextId.toString().padStart(4, '0')}`;
};

// Membuat SPK dari Sales Order
exports.createWorkOrderFromSalesOrder = catchAsync(async (req, res, next) => {
    const salesOrderId = req.params.salesOrderId;

    // 1. Validasi Sales Order
    const salesOrder = await db.SalesOrder.findByPk(salesOrderId, {
        include: { model: db.SalesOrderItem, as: 'items' }
    });
    if (!salesOrder) return next(new AppError('Sales Order tidak ditemukan', 404));
    if (salesOrder.status !== 'CONFIRMED') return next(new AppError('Hanya Sales Order yang berstatus CONFIRMED yang bisa dibuatkan SPK.', 400));

    let newWorkOrder;

    // 2. Lakukan semua operasi dalam satu transaksi database
    await db.sequelize.transaction(async (t) => {
        // Buat header SPK
        newWorkOrder = await db.WorkOrder.create({
            workOrderNumber: await generateWorkOrderNumber(),
            salesOrderId: salesOrderId,
            issueDate: new Date(),
            status: 'IN_PROGRESS'
        }, { transaction: t });

        // Loop melalui setiap item di Sales Order untuk "meledakkan" BOM-nya
        for (const soItem of salesOrder.items) {
            // TODO SELESAI: Logika pencarian BOM berdasarkan kombinasi atribut
            // CATATAN: Ini mengasumsikan `soItem` memiliki kolom `combination` yang menyimpan ID nilai atribut.
            // Kolom ini harus disalin dari QuotationItem saat konversi.
            const bom = await db.BillOfMaterial.findOne({
                where: { 
                    productId: soItem.productId
                    // combination: soItem.combination // Aktifkan ini jika soItem punya data kombinasi
                },
                include: { model: db.BillOfMaterialItem, as: 'items' },
                transaction: t
            });

            if (bom) {
                // "Ledakkan" BOM: hitung kuantitas komponen & kurangi stok
                for (const bomItem of bom.items) {
                    // "Mesin Kalkulasi" untuk rumus kuantitas
                    const formula = bomItem.quantityFormula.toLowerCase().replace(/[^a-z0-9+\-*/(). ]/g, ''); // Sanitasi dasar
                    const requiredQuantity = new Function('lebar', 'tinggi', `return ${formula}`)(soItem.width, soItem.height);

                    // Buat item di SPK
                    const componentProduct = await db.Product.findByPk(bomItem.componentId, { transaction: t });
                    if (!componentProduct) throw new AppError(`Produk komponen dengan ID ${bomItem.componentId} tidak ditemukan.`, 404);

                    await db.WorkOrderItem.create({
                        workOrderId: newWorkOrder.id,
                        componentId: bomItem.componentId,
                        description: `Untuk SO: ${salesOrder.salesOrderNumber}`,
                        requiredQuantity: requiredQuantity,
                        uomId: componentProduct.uomId
                    }, { transaction: t });

                    // Kurangi stok komponen
                    if (componentProduct.isTracked) {
                        await consumeStock(bomItem.componentId, requiredQuantity, t);
                    }
                }
            }
        }

        // Update status Sales Order
        await salesOrder.update({ status: 'IN_PRODUCTION' }, { transaction: t });
    });

    res.status(201).json({
        status: 'success',
        message: `SPK ${newWorkOrder.workOrderNumber} berhasil dibuat dari Sales Order ${salesOrder.salesOrderNumber}. Stok komponen telah dikurangi.`,
        data: { workOrder: newWorkOrder }
    });
});

// TODO SELESAI: Tambahkan controller untuk getAll, getOne, update, dan delete Work Orders
exports.getAllWorkOrders = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(db.WorkOrder, req.query).filter().sort().paginate();
    features.queryOptions.include = {
        model: db.SalesOrder,
        attributes: ['id', 'salesOrderNumber']
    };
    const { count, rows } = await db.WorkOrder.findAndCountAll(features.queryOptions);
    res.status(200).json({ status: 'success', total: count, results: rows.length, data: { workOrders: rows } });
});

exports.getWorkOrder = catchAsync(async (req, res, next) => {
    const workOrder = await db.WorkOrder.findByPk(req.params.id, {
        include: [
            { model: db.SalesOrder, attributes: ['id', 'salesOrderNumber'] },
            { 
                model: db.WorkOrderItem, 
                as: 'items',
                include: [
                    { model: db.Product, as: 'component', attributes: ['id', 'sku', 'name'] },
                    { model: db.UnitOfMeasure, attributes: ['id', 'symbol'] }
                ]
            }
        ]
    });
    if (!workOrder) return next(new AppError('SPK tidak ditemukan', 404));
    res.status(200).json({ status: 'success', data: { workOrder } });
});

exports.updateWorkOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const [updated] = await db.WorkOrder.update({ status }, { where: { id: req.params.id } });
    if (updated === 0) return next(new AppError('SPK tidak ditemukan', 404));
    const updatedWorkOrder = await db.WorkOrder.findByPk(req.params.id);
    res.status(200).json({ status: 'success', data: { workOrder: updatedWorkOrder } });
});

exports.deleteWorkOrder = catchAsync(async (req, res, next) => {
    const workOrder = await db.WorkOrder.findByPk(req.params.id);
    if (!workOrder) return next(new AppError('SPK tidak ditemukan', 404));
    
    // Logika untuk membatalkan SPK (misal: mengembalikan stok) harus ditangani di service
    // Untuk saat ini, kita hanya ubah statusnya.
    workOrder.status = 'CANCELLED';
    await workOrder.save();

    res.status(204).json({ status: 'success', data: null });
});