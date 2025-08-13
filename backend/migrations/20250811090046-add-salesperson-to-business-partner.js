'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('BusinessPartners', 'salespersonId', {
      type: Sequelize.UUID,
      allowNull: true, // Set ke false jika wajib diisi
      references: {
        model: 'Users', // Nama tabel Users
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('BusinessPartners', 'salespersonId');
  }
};