'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Buat tabel Brands
      await queryInterface.createTable('Brands', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 2. Buat tabel SubCategories
      await queryInterface.createTable('SubCategories', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        productCategoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'ProductCategories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      // 3. Tambahkan semua kolom baru ke tabel Products
      await queryInterface.addColumn('Products', 'subCategoryId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'SubCategories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });
      
      await queryInterface.addColumn('Products', 'brandId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Brands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      await queryInterface.addColumn('Products', 'tags', {
        type: Sequelize.JSONB,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Products', 'purchasePrice', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Products', 'noDiscount', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('Products', 'reorderPoint', {
        type: Sequelize.INTEGER,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Products', 'lotNumberTracking', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('Products', 'isBundle', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('Products', 'isService', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    // Perintah untuk membatalkan migrasi (jika diperlukan)
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Products', 'isService', { transaction });
      await queryInterface.removeColumn('Products', 'isBundle', { transaction });
      await queryInterface.removeColumn('Products', 'lotNumberTracking', { transaction });
      await queryInterface.removeColumn('Products', 'reorderPoint', { transaction });
      await queryInterface.removeColumn('Products', 'noDiscount', { transaction });
      await queryInterface.removeColumn('Products', 'purchasePrice', { transaction });
      await queryInterface.removeColumn('Products', 'tags', { transaction });
      await queryInterface.removeColumn('Products', 'brandId', { transaction });
      await queryInterface.removeColumn('Products', 'subCategoryId', { transaction });
      await queryInterface.dropTable('SubCategories', { transaction });
      await queryInterface.dropTable('Brands', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
