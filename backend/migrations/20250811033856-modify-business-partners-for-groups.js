// File: migrations/YYYYMMDDHHMMSS-modify-business-partners-for-groups.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tambahkan kolom baru 'partnerGroupId'
    await queryInterface.addColumn('BusinessPartners', 'partnerGroupId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Izinkan null sementara untuk data yang sudah ada
      references: {
        model: 'BusinessPartnerGroups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. Hapus kolom lama 'partnerType'
    await queryInterface.removeColumn('BusinessPartners', 'partnerType');
  },

  async down(queryInterface, Sequelize) {
    // Logika untuk membatalkan (rollback) migrasi
    await queryInterface.addColumn('BusinessPartners', 'partnerType', {
      type: Sequelize.ENUM('CUSTOMER', 'SUPPLIER'),
      allowNull: false
    });
    await queryInterface.removeColumn('BusinessPartners', 'partnerGroupId');
  }
};