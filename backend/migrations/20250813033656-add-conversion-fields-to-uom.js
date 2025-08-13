'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('UnitOfMeasures', 'uomType', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'lainnya'
      }, { transaction });

      await queryInterface.addColumn('UnitOfMeasures', 'factor', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1
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
      await queryInterface.removeColumn('UnitOfMeasures', 'factor', { transaction });
      await queryInterface.removeColumn('UnitOfMeasures', 'uomType', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
