// File: migrations/YYYYMMDDHHMMSS-add-status-index-to-products.js
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Menambahkan indeks ke kolom 'status' di tabel 'Products'
    await queryInterface.addIndex('Products', ['status']);
  },

  async down (queryInterface, Sequelize) {
    // Perintah untuk membatalkan (undo) migrasi
    await queryInterface.removeIndex('Products', ['status']);
  }
};
