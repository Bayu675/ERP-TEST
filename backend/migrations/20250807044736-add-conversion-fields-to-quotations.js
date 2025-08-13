// File: migrations/YYYYMMDDHHMMSS-add-conversion-fields-to-quotations.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom baru ke tabel Quotations yang sudah ada
    await queryInterface.addColumn('Quotations', 'convertedToSalesOrderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      // Kita belum bisa menambahkan referensi ke SalesOrders karena tabelnya belum ada
    });
    await queryInterface.addColumn('Quotations', 'convertedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    // Menambahkan nilai 'CONVERTED' ke ENUM status
    await queryInterface.changeColumn('Quotations', 'status', {
        type: Sequelize.ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'),
        allowNull: false,
        defaultValue: 'DRAFT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Quotations', 'convertedToSalesOrderId');
    await queryInterface.removeColumn('Quotations', 'convertedAt');
    // Mengembalikan ENUM ke versi sebelumnya
    await queryInterface.changeColumn('Quotations', 'status', {
        type: Sequelize.ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'DRAFT'
    });
  }
};