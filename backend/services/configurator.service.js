// File: backend/services/configurator.service.js (Diperbarui dengan Konversi Satuan)
'use strict';
const { create, all } = require('mathjs');
const db = require('../models');
const unitConversionService = require('./unitConversion.service'); // 1. Impor service baru

// Konfigurasi mathjs yang aman
const math = create(all, {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'number',
  precision: 64,
});

const computeConfiguration = async (templateVersion, parameterValues) => {
    const resolvedComponents = [];
    const warnings = [];
    const scope = { ...templateVersion.constants };

    // --- LOGIKA BARU: KONVERSI PARAMETER KE SATUAN DASAR ---
    for (const param of templateVersion.parameters) {
        const value = parameterValues[param.code];
        if (param.type === 'number' && param.uomId && value) {
            // Konversi nilai parameter ke satuan dasar (misal: cm -> mm)
            scope[param.code] = await unitConversionService.convertToBaseUnit(value, param.uomId);
        } else {
            scope[param.code] = value;
        }
    }

    // Iterasi melalui setiap komponen dalam template
    for (const component of templateVersion.components) {
        try {
            let calculatedQtyInBase = math.evaluate(component.qty_expression, scope);

            if (component.loss_factor && component.loss_factor > 0) {
                calculatedQtyInBase *= (1 + component.loss_factor / 100);
            }

            // --- LOGIKA BARU: KONVERSI HASIL KEMBALI KE SATUAN KOMPONEN ---
            // Misal: hasil dalam mm, konversi kembali ke mtr jika satuan komponen adalah mtr
            let finalQty = await unitConversionService.convertFromBaseUnit(calculatedQtyInBase, component.uomId);

            if (component.unit === 'pcs') { // 'unit' di sini bisa diganti dengan tipe UoM
                finalQty = Math.ceil(finalQty);
            } else {
                finalQty = parseFloat(finalQty.toFixed(4)); // Tampilkan dengan presisi
            }

            if (isNaN(finalQty) || finalQty < 0) {
                throw new Error(`Hasil perhitungan tidak valid.`);
            }

            resolvedComponents.push({
                sku: component.sku,
                name: component.name,
                qty: finalQty,
                unit: component.unit, // Sebaiknya ambil dari data UoM komponen
                subtotal: finalQty * (component.cost_per_unit || 0)
            });

        } catch (error) {
            warnings.push(`Error pada komponen "${component.name}": ${error.message}`);
        }
    }

    const totalCost = resolvedComponents.reduce((sum, comp) => sum + comp.subtotal, 0);

    return { resolvedComponents, totalCost, warnings };
};

module.exports = { computeConfiguration };
