'use strict';

const usersData =[
  {
    firstname: 'System',
    lastname: 'Front Desk',
    email: 'frontdesk123@gmail.com',
    password: 'frontdesk123',
    role_id: 2,
    status: 'active',
    createdAt: new Date(Date.now())
  },
  {
    firstname: 'System',
    lastname: 'Inventory Supervisor',
    email: 'inventory123@gmail.com',
    password: 'inventory123',
    role_id: 3,
    status: 'active',
    createdAt: new Date(Date.now())
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try{
      await queryInterface.bulkInsert('users', usersData, {})
    }catch(err){
      console.log(err)
    }
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
