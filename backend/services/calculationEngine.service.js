// File: services/calculationEngine.service.js (dengan Logika Diskon Manual per Item)

'use strict';
const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/appError');

const calculateQuotation = async (payload) => {
  const { customerId, salespersonId, quotationDate, items, headerDiscountValue } = payload;
  
  let groupDiscountString = '0';
  if (customerId) {
    const customer = await db.BusinessPartner.findByPk(customerId, {
      include: { model: db.BusinessPartnerGroup, as: 'group', attributes: ['defaultDiscount'] }
    });
    if (customer && customer.group && customer.group.defaultDiscount) {
      groupDiscountString = customer.group.defaultDiscount;
    }
  }

  let subTotal = 0;
  let totalItemDiscount = 0;
  const processedItems = [];

  for (const item of items) {
    if (!item.productId) continue;

    const product = await db.Product.findByPk(item.productId, {
        include: { model: db.UnitOfMeasure, as: 'uom' }
    });
    if (!product) throw new AppError(`Produk dengan ID ${item.productId} tidak ditemukan.`, 404);

    let priceConfig = await db.PriceConfiguration.findOne({ where: { productId: item.productId } });
    if (!priceConfig) {
        priceConfig = {
            pricePerSquareMeter: product.standardSalePrice || 0,
            minCalculationWidth: 0,
            minCalculationHeight: 0,
        };
    }
    
    const width = parseFloat(item.width) || 0;
    const height = parseFloat(item.height) || 0;
    const quantity = parseInt(item.quantity) || 0;

    let calculationWidth = Math.max(width, priceConfig.minCalculationWidth || 0);
    let calculationHeight = Math.max(height, priceConfig.minCalculationHeight || 0);

    const calculatedAreaPerUnit = (calculationWidth * calculationHeight) / 10000;
    const totalCalculatedArea = calculatedAreaPerUnit * quantity;
    const basePrice = totalCalculatedArea * priceConfig.pricePerSquareMeter;

    let itemDiscountAmount = 0;
    let currentPrice = basePrice;
    const processedDiscounts = [];

    // --- PERUBAHAN LOGIKA DISKON ---
    // Prioritaskan diskon manual jika ada, jika tidak, gunakan diskon grup.
    const discountStringToUse = (item.manualDiscount && item.manualDiscount.trim() !== '') ? item.manualDiscount : groupDiscountString;
    
    const discounts = discountStringToUse.split('+').map(d => parseFloat(d.trim()));
    discounts.forEach((discPercentage) => {
        if (isNaN(discPercentage) || discPercentage <= 0) return;
        const discount = currentPrice * (discPercentage / 100);
        itemDiscountAmount += discount;
        currentPrice -= discount;
        processedDiscounts.push({ discountPercentage: discPercentage });
    });
    // --- AKHIR PERUBAHAN ---

    const netPrice = basePrice - itemDiscountAmount;

    subTotal += basePrice;
    totalItemDiscount += itemDiscountAmount;

    processedItems.push({
      productId: item.productId,
      sku: product.sku,
      uom: product.uom ? product.uom.symbol : 'N/A',
      width: width,
      height: height,
      calculatedArea: totalCalculatedArea,
      pricePerArea: priceConfig.pricePerSquareMeter,
      basePrice,
      netPrice,
      quantity: quantity,
      discounts: processedDiscounts,
      description: item.description || product.name,
      notes: item.notes,
    });
  }

  const taxableAmountBeforeHeaderDiscount = subTotal - totalItemDiscount;
  
  let headerDiscountAmount = 0;
  if (headerDiscountValue) {
      if (headerDiscountValue.includes('%')) {
          const percentage = parseFloat(headerDiscountValue.replace('%', ''));
          headerDiscountAmount = taxableAmountBeforeHeaderDiscount * (percentage / 100);
      } else {
          headerDiscountAmount = parseFloat(headerDiscountValue);
      }
  }

  const taxableAmount = taxableAmountBeforeHeaderDiscount - headerDiscountAmount;
  
  const taxRate = 11; 
  const totalTax = taxableAmount * (taxRate / 100);
  const grandTotal = taxableAmount + totalTax;

  return {
    header: {
      customerId,
      salespersonId,
      quotationDate,
      expiryDate: new Date(new Date(quotationDate).getTime() + 14 * 24 * 60 * 60 * 1000),
      status: 'DRAFT',
      subTotal,
      totalItemDiscount,
      headerDiscountValue,
      headerDiscountAmount,
      taxableAmount,
      totalTax,
      grandTotal,
    },
    items: processedItems,
  };
};

module.exports = {
  calculateQuotation,
};
