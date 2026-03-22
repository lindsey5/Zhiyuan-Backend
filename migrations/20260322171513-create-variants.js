'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("variants", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        product_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        variant_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        image_url: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        image_public_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        stock: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },

        sku: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
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
