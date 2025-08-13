// File: controllers/quotation.controller.js (LENGKAP)
'use strict';
const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { calculateQuotation } = require('../services/calculationEngine.service');

// Fungsi untuk generate nomor penawaran unik
const generateQuotationNumber = async () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const prefix = `QT${year}${month}${day}-`;
    
    const lastQuotation = await db.Quotation.findOne({
        where: { quotationNumber: { [db.Sequelize.Op.like]: `${prefix}%` } },
        order: [['quotationNumber', 'DESC']],
    });
    
    let nextId = 1;
    if (lastQuotation) {
        const lastId = parseInt(lastQuotation.quotationNumber.split('-')[1]);
        nextId = lastId + 1;
    }
    
    return `${prefix}${nextId.toString().padStart(3, '0')}`;
};

// --- FUNGSI BARU DIMULAI DARI SINI ---

// Membuat Penawaran baru
exports.createQuotation = catchAsync(async (req, res, next) => {
    const payload = {
        ...req.body,
        salespersonId: req.user.id, // Ambil ID salesperson dari user yang login
    };

    // 1. Panggil "Mesin Kalkulasi"
    const calculationResult = await calculateQuotation(payload);
    
    // 2. Generate nomor penawaran
    calculationResult.header.quotationNumber = await generateQuotationNumber();

    // 3. Simpan ke database menggunakan transaksi
    const newQuotation = await db.sequelize.transaction(async (t) => {
        const quotation = await db.Quotation.create(calculationResult.header, { transaction: t });
        
        for (const item of calculationResult.items) {
            const quotationItem = await db.QuotationItem.create({
                ...item,
                quotationId: quotation.id,
            }, { transaction: t });
            
            if (item.discounts && item.discounts.length > 0) {
                const discounts = item.discounts.map(disc => ({
                    ...disc,
                    quotationItemId: quotationItem.id,
                }));
                await db.QuotationItemDiscount.bulkCreate(discounts, { transaction: t });
            }
        }
        
        return quotation;
    });

    // 4. Ambil kembali data lengkap untuk ditampilkan
    const fullQuotation = await db.Quotation.findByPk(newQuotation.id, {
        include: [
            { model: db.BusinessPartner, as: 'customer' },
            { 
                model: db.QuotationItem, 
                as: 'items',
                include: [{ model: db.QuotationItemDiscount, as: 'discounts' }]
            }
        ]
    });

    res.status(201).json({ status: 'success', data: { quotation: fullQuotation } });
});

// Mendapatkan semua Penawaran
exports.getAllQuotations = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(db.Quotation, req.query)
        .filter()
        .sort()
        .paginate();
    
    features.queryOptions.include = [
        { model: db.BusinessPartner, as: 'customer', attributes: ['id', 'name'] },
        { model: db.User, as: 'salesperson', attributes: ['id', 'username'] }
    ];

    const { count, rows } = await db.Quotation.findAndCountAll(features.queryOptions);

    res.status(200).json({
        status: 'success',
        total: count,
        results: rows.length,
        data: { quotations: rows }
    });
});

// Mendapatkan satu Penawaran
exports.getQuotation = catchAsync(async (req, res, next) => {
    const quotation = await db.Quotation.findByPk(req.params.id, {
        include: [
            { model: db.BusinessPartner, as: 'customer' },
            { model: db.User, as: 'salesperson', attributes: ['id', 'username'] },
            { 
                model: db.QuotationItem, 
                as: 'items',
                include: [
                    { model: db.Product, attributes: ['id', 'sku', 'name'] },
                    { model: db.QuotationItemDiscount, as: 'discounts' }
                ]
            }
        ]
    });

    if (!quotation) {
        return next(new AppError('Penawaran dengan ID tersebut tidak ditemukan', 404));
    }

    res.status(200).json({ status: 'success', data: { quotation } });
});

// Mengupdate Penawaran (Overwrite)
exports.updateQuotation = catchAsync(async (req, res, next) => {
    const quotationId = req.params.id;

    // START: skip calculateQuotation when only status is updated
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length === 1 && bodyKeys[0] === 'status') {
        const quotation = await db.Quotation.findByPk(quotationId);
        if (!quotation) {
            return next(new AppError('Penawaran dengan ID tersebut tidak ditemukan', 404));
        }

        // Validasi sederhana untuk nilai status
        const allowedStatuses = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'];
        if (!allowedStatuses.includes(req.body.status)) {
            return next(new AppError('Nilai status tidak valid.', 400));
        }

        quotation.status = req.body.status;
        await quotation.save();

        return res.status(200).json({ status: 'success', data: { quotation } });
    }
    // END: skip calculateQuotation when only status is updated

    const payload = {
        ...req.body,
        salespersonId: req.user.id,
    };

    // 1. Panggil "Mesin Kalkulasi" dengan data baru
    const calculationResult = await calculateQuotation(payload);

    // 2. Update database menggunakan transaksi
    await db.sequelize.transaction(async (t) => {
        // Hapus item dan diskon lama
        await db.QuotationItemDiscount.destroy({
            where: {
                quotationItemId: {
                    [db.Sequelize.Op.in]: db.sequelize.literal(`(SELECT id FROM "QuotationItems" WHERE "quotationId" = ${quotationId})`)
                }
            }
        }, { transaction: t });
        await db.QuotationItem.destroy({ where: { quotationId } }, { transaction: t });

        // Update header penawaran
        await db.Quotation.update(calculationResult.header, { where: { id: quotationId } }, { transaction: t });

        // Buat item dan diskon baru
        for (const item of calculationResult.items) {
            const quotationItem = await db.QuotationItem.create({
                ...item,
                quotationId: quotationId,
            }, { transaction: t });
            
            if (item.discounts && item.discounts.length > 0) {
                const discounts = item.discounts.map(disc => ({
                    ...disc,
                    quotationItemId: quotationItem.id,
                }));
                await db.QuotationItemDiscount.bulkCreate(discounts, { transaction: t });
            }
        }
    });

    // 3. Ambil kembali data yang sudah diupdate
    const updatedQuotation = await db.Quotation.findByPk(quotationId, {
        include: [
            { model: db.BusinessPartner, as: 'customer' },
            { 
                model: db.QuotationItem, 
                as: 'items',
                include: [{ model: db.QuotationItemDiscount, as: 'discounts' }]
            }
        ]
    });
    
    res.status(200).json({ status: 'success', data: { quotation: updatedQuotation } });
});

// Menghapus (Mengarsipkan) Penawaran
exports.deleteQuotation = catchAsync(async (req, res, next) => {
    const [updated] = await db.Quotation.update(
        { status: 'ARCHIVED' },
        { where: { id: req.params.id } }
    );

    if (updated === 0) {
        return next(new AppError('Penawaran dengan ID tersebut tidak ditemukan', 404));
    }

    res.status(204).json({ status: 'success', data: null });
});

// Fungsi baru untuk mengonversi Penawaran menjadi Pesanan Penjualan
exports.convertQuotationToSalesOrder = catchAsync(async (req, res, next) => {
    const quotationId = req.params.id;

    // 1. Cari penawaran yang akan dikonversi, pastikan semua data terkait ikut terambil
    const quotation = await db.Quotation.findByPk(quotationId, {
        include: {
            model: db.QuotationItem,
            as: 'items',
            include: { model: db.QuotationItemDiscount, as: 'discounts' }
        }
    });

    // 2. Validasi
    if (!quotation) {
        return next(new AppError('Penawaran dengan ID tersebut tidak ditemukan', 404));
    }
    if (quotation.status !== 'APPROVED') {
        return next(new AppError('Hanya penawaran yang berstatus APPROVED yang bisa dikonversi.', 400));
    }
    if (quotation.convertedToSalesOrderId) {
        return next(new AppError('Penawaran ini sudah pernah dikonversi.', 400));
    }

    // Fungsi untuk generate nomor Sales Order
    const generateSalesOrderNumber = async () => {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const prefix = `SO${year}${month}-`;
        const lastSO = await db.SalesOrder.findOne({
            where: { salesOrderNumber: { [db.Sequelize.Op.like]: `${prefix}%` } },
            order: [['salesOrderNumber', 'DESC']],
        });
        let nextId = 1;
        if (lastSO) {
            nextId = parseInt(lastSO.salesOrderNumber.split('-')[1]) + 1;
        }
        return `${prefix}${nextId.toString().padStart(4, '0')}`;
    };

    let newSalesOrder;

    // 3. Lakukan konversi di dalam sebuah transaksi database
    await db.sequelize.transaction(async (t) => {
        // Buat header Sales Order
        newSalesOrder = await db.SalesOrder.create({
            salesOrderNumber: await generateSalesOrderNumber(),
            quotationId: quotation.id,
            customerId: quotation.customerId,
            salespersonId: quotation.salespersonId,
            orderDate: new Date(),
            status: 'CONFIRMED', // Langsung dikonfirmasi
            grandTotal: quotation.grandTotal,
        }, { transaction: t });

        // Salin item dari penawaran ke pesanan penjualan
        const salesOrderItems = quotation.items.map(item => ({
            salesOrderId: newSalesOrder.id,
            productId: item.productId,
            description: item.description,
            width: item.width,
            height: item.height,
            quantity: item.quantity,
            netPrice: item.netPrice,
        }));

        await db.SalesOrderItem.bulkCreate(salesOrderItems, { transaction: t });

        // 4. Update status penawaran asli
        await quotation.update({
            status: 'CONVERTED',
            convertedToSalesOrderId: newSalesOrder.id,
            convertedAt: new Date(),
        }, { transaction: t });
    });

    // 5. Kirim kembali data Sales Order yang baru dibuat
    res.status(201).json({
        status: 'success',
        message: `Penawaran ${quotation.quotationNumber} berhasil dikonversi menjadi Sales Order ${newSalesOrder.salesOrderNumber}.`,
        data: { salesOrder: newSalesOrder }
    });
});
