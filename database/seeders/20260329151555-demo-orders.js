'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('orders', [
      {
        order_id: 'ORD001',
        customer_name: 'John Doe',
        status: 'pending',
        total_amount: 1200.50,
        order_date: new Date(),
        delivery_type: 'delivery',
        payment_method: 'GCash',
        payment_status: 'unpaid',
      },
      {
        order_id: 'ORD002',
        customer_name: 'Jane Smith',
        status: 'completed',
        total_amount: 850.00,
        order_date: new Date(),
        delivery_type: 'pickup',
        payment_method: 'Card',
        payment_status: 'paid',
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
