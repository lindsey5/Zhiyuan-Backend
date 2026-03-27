'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("permissions", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            action: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        });
    },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("products");
  }
};
