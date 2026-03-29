'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      delivery_type: {
        type: DataTypes.ENUM('pickup', 'delivery'),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM('COD', 'GCash', 'Card'),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM('paid', 'unpaid'),
        allowNull: false,
        defaultValue: 'unpaid',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
