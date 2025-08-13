// File: controllers/salesOrder.controller.js (BARU)
'use strict';
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
// Kita akan memerlukan Mesin Kalkulasi lagi saat update
const { calculateQuotation } = require('../services/calculationEngine.service');

// Mendapatkan semua Pesanan Penjualan
exports.getAllSalesOrders = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(db.SalesOrder, req.query)
        .filter()
        .sort()
        .paginate();
    
    features.queryOptions.include = [
        { model: db.BusinessPartner, as: 'customer', attributes: ['id', 'name'] },
        { model: db.User, as: 'salesperson', attributes: ['id', 'username'] }
    ];

    const { count, rows } = await db.SalesOrder.findAndCountAll(features.queryOptions);

    res.status(200).json({
        status: 'success',
        total: count,
        results: rows.length,
        data: { salesOrders: rows }
    });
});

// Mendapatkan satu Pesanan Penjualan
exports.getSalesOrder = catchAsync(async (req, res, next) => {
    const salesOrder = await db.SalesOrder.findByPk(req.params.id, {
        include: [
            { model: db.BusinessPartner, as: 'customer' },
            { model: db.User, as: 'salesperson', attributes: ['id', 'username'] },
            { model: db.PaymentTerm },
            { 
                model: db.SalesOrderItem, 
                as: 'items',
                include: [{ model: db.Product, attributes: ['id', 'sku', 'name'] }]
            }
        ]
    });

    if (!salesOrder) {
        return next(new AppError('Pesanan Penjualan dengan ID tersebut tidak ditemukan', 404));
    }

    res.status(200).json({ status: 'success', data: { salesOrder } });
});

// Mengupdate Pesanan Penjualan (untuk revisi saat DRAFT)
exports.updateSalesOrder = catchAsync(async (req, res, next) => {
    const salesOrderId = req.params.id;

    const salesOrder = await db.SalesOrder.findByPk(salesOrderId);
    if (!salesOrder) {
        return next(new AppError('Pesanan Penjualan tidak ditemukan', 404));
    }
    // Hanya izinkan update jika status masih DRAFT (kecuali untuk supervisor/admin)
    if (salesOrder.status !== 'DRAFT' && req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return next(new AppError('Pesanan Penjualan yang sudah dikonfirmasi tidak bisa diubah.', 400));
    }

    // Jika item di-update, kita perlu menghitung ulang totalnya
    if (req.body.items) {
        const payload = {
            ...req.body,
            salespersonId: req.user.id,
        };

        // Panggil "Mesin Kalkulasi" untuk menghitung ulang harga berdasarkan item baru
        const calculationResult = await calculateQuotation(payload);

        await db.sequelize.transaction(async (t) => {
            // Hapus item lama
            await db.SalesOrderItem.destroy({ where: { salesOrderId } }, { transaction: t });
            
            // Update header SO dengan total yang baru
            await salesOrder.update({
                grandTotal: calculationResult.header.grandTotal,
                // Update field lain jika ada
                customerPoNumber: req.body.customerPoNumber,
                deliveryMethod: req.body.deliveryMethod,
                useCompanyLogo: req.body.useCompanyLogo,
                paymentTermId: req.body.paymentTermId,
            }, { transaction: t });

            // Buat item baru
            const newItems = calculationResult.items.map(item => ({
                ...item,
                salesOrderId: salesOrderId,
            }));
            await db.SalesOrderItem.bulkCreate(newItems, { transaction: t });
        });
    } else {
        // Jika hanya update header (misal: ganti metode pengiriman)
        await salesOrder.update(req.body);
    }
    
    const updatedSalesOrder = await db.SalesOrder.findByPk(salesOrderId);
    res.status(200).json({ status: 'success', data: { salesOrder: updatedSalesOrder } });
});

// Menghapus (Membatalkan) Pesanan Penjualan
exports.deleteSalesOrder = catchAsync(async (req, res, next) => {
    const [updated] = await db.SalesOrder.update(
        { status: 'CANCELLED' }, // Gunakan status CANCELLED, bukan ARCHIVED
        { where: { id: req.params.id } }
    );

    if (updated === 0) {
        return next(new AppError('Pesanan Penjualan tidak ditemukan', 404));
    }

    res.status(204).json({ status: 'success', data: null });
});