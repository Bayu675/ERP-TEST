// File: migrations/YYYYMMDDHHMMSS-update-discount-and-email-fields.js

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Mengubah kolom defaultDiscount di tabel BusinessPartnerGroups
      await queryInterface.changeColumn('BusinessPartnerGroups', 'defaultDiscount', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '0'
      }, { transaction });

      // Mengubah kolom email di tabel BusinessPartners
      await queryInterface.changeColumn('BusinessPartners', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Mengembalikan kolom defaultDiscount ke FLOAT
      await queryInterface.changeColumn('BusinessPartnerGroups', 'defaultDiscount', {
        type: Sequelize.FLOAT,
        defaultValue: 0
      }, { transaction });

      // Mengembalikan kolom email ke not null
      await queryInterface.changeColumn('BusinessPartners', 'email', {
        type: Sequelize.STRING,
        allowNull: false, // Kembali ke tidak boleh null
        validate: {
          isEmail: true
        }
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};