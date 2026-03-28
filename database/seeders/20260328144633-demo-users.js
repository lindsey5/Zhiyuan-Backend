'use strict';

const usersData =[
  {
    firstname: 'System',
    lastname: 'Admin',
    email: 'admin123@gmail.com',
    password: 'admin123',
    role_id: 1,
  },
  {
    firstname: 'System',
    lastname: 'Front Desk',
    email: 'frontdesk123@gmail.com',
    password: 'frontdesk123',
    role_id: 2,
  },
  {
    firstname: 'System',
    lastname: 'Inventory Supervisor',
    email: 'inventory123@gmail.com',
    password: 'inventory123',
    role_id: 3,
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', usersData, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
