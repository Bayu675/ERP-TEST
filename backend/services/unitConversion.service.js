// File: backend/services/unitConversion.service.js (BARU)
'use strict';
const db = require('../models');
const AppError = require('../utils/appError');

const UnitOfMeasure = db.UnitOfMeasure;

/**
 * Mengkonversi nilai dari satu satuan ke satuan dasar (base unit).
 * @param {number} value - Nilai yang akan dikonversi.
 * @param {number} uomId - ID dari satuan asal.
 * @returns {Promise<number>} Nilai yang sudah dikonversi ke satuan dasar.
 */
const convertToBaseUnit = async (value, uomId) => {
    const uom = await UnitOfMeasure.findByPk(uomId);
    if (!uom) {
        throw new AppError(`Satuan dengan ID ${uomId} tidak ditemukan.`, 404);
    }
    // Konversi: nilai * faktor
    return value * uom.factor;
};

/**
 * Mengkonversi nilai dari satuan dasar (base unit) ke satuan target.
 * @param {number} valueInBase - Nilai dalam satuan dasar yang akan dikonversi.
 * @param {number} targetUomId - ID dari satuan tujuan.
 * @returns {Promise<number>} Nilai yang sudah dikonversi ke satuan tujuan.
 */
const convertFromBaseUnit = async (valueInBase, targetUomId) => {
    const targetUom = await UnitOfMeasure.findByPk(targetUomId);
    if (!targetUom) {
        throw new AppError(`Satuan dengan ID ${targetUomId} tidak ditemukan.`, 404);
    }
    // Konversi: nilai / faktor
    return valueInBase / targetUom.factor;
};

module.exports = {
    convertToBaseUnit,
    convertFromBaseUnit
};
