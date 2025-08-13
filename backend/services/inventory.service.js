// File: services/inventory.service.js (BARU)
// Service ini akan berisi semua logika kompleks terkait inventaris.
'use strict';
const db = require('../models');
const AppError = require('../utils/appError');

/**
 * Mengurangi stok dari lot inventaris berdasarkan strategi FIFO.
 * @param {string} productId - ID produk komponen yang akan dikurangi.
 * @param {number} requiredQuantity - Jumlah yang dibutuhkan.
 * @param {object} transaction - Transaksi Sequelize.
 */
const consumeStock = async (productId, requiredQuantity, transaction) => {
    let remainingToConsume = requiredQuantity;

    // Cari semua lot untuk produk ini yang masih memiliki stok, urutkan berdasarkan FIFO (tanggal terima paling lama)
    const availableLots = await db.InventoryLot.findAll({
        where: {
            productId: productId,
            currentQuantity: { [db.Sequelize.Op.gt]: 0 }
        },
        order: [['receivedDate', 'ASC']],
        transaction
    });

    if (availableLots.reduce((total, lot) => total + lot.currentQuantity, 0) < requiredQuantity) {
        throw new AppError(`Stok tidak mencukupi untuk produk ID: ${productId}. Dibutuhkan: ${requiredQuantity}, tersedia: ${availableLots.reduce((total, lot) => total + lot.currentQuantity, 0)}`, 409); // 409 Conflict
    }

    for (const lot of availableLots) {
        if (remainingToConsume <= 0) break;

        const quantityToTake = Math.min(lot.currentQuantity, remainingToConsume);
        
        lot.currentQuantity -= quantityToTake;
        await lot.save({ transaction });

        remainingToConsume -= quantityToTake;

        // TODO SELESAI: Buat record di tabel InventoryTransactions untuk mencatat pergerakan ini.
        // CATATAN: Ini mengasumsikan kita akan membuat model 'InventoryTransaction' nanti.
        /*
        if (db.InventoryTransaction) {
            await db.InventoryTransaction.create({
                productId: productId,
                lotId: lot.id,
                transactionType: 'OUT',
                quantity: -quantityToTake,
                notes: 'Digunakan untuk produksi SPK.'
            }, { transaction });
        }
        */
    }
};

module.exports = { consumeStock };