'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('order_items', [
      {
        order_id: 1,   
        variant_id: 1,
        quantity: 2,
        amount: 500.0,
        price: 250.0,
      },
      {
        order_id: 1,
        variant_id: 2,
        quantity: 1,
        amount: 300.0,
        price: 300.0,
      },
      {
        order_id: 2,     
        variant_id: 3,
        quantity: 3,
        amount: 900.0,
        price: 300.0,
      },
    ]);
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
