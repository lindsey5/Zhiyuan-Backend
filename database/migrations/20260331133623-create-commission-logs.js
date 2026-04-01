'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('commission_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      commission_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('commission_logs');
  },
};
