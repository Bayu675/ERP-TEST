'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    return queryInterface.bulkInsert('Users', [{
      id: Sequelize.literal('uuid_generate_v4()'), // Ini penting!
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', { username: 'admin' }, {});
  }
};
