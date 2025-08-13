'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Buat tabel ConfigTemplates
      await queryInterface.createTable('ConfigTemplates', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        description: { type: Sequelize.TEXT },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE }
      }, { transaction });

      // 2. Buat tabel TemplateVersions
      await queryInterface.createTable('TemplateVersions', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        templateId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'ConfigTemplates', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        status: { type: Sequelize.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'), defaultValue: 'DRAFT' },
        parameters: { type: Sequelize.JSONB, allowNull: false },
        components: { type: Sequelize.JSONB, allowNull: false },
        constants: { type: Sequelize.JSONB, allowNull: true },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE }
      }, { transaction });

      // Tambahkan index unik untuk templateId dan version
      await queryInterface.addIndex('TemplateVersions', ['templateId', 'version'], {
        unique: true,
        transaction: transaction
      });

      // 3. Buat tabel ProductLinks
      await queryInterface.createTable('ProductLinks', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        productId: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: { model: 'Products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        templateId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'ConfigTemplates', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE }
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
      await queryInterface.dropTable('ProductLinks', { transaction });
      await queryInterface.dropTable('TemplateVersions', { transaction });
      await queryInterface.dropTable('ConfigTemplates', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
