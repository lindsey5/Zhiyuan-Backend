'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('distributors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parent_distributor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      creator: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      distributor_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      commission_rate: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      wallet_balance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'deleted'),
        allowNull: false,
        defaultValue: 'active',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('distributors');
  },
};
