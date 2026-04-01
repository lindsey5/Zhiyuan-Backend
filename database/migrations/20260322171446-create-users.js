'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            firstname: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            lastname: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
            },

            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            role_id: {
                type: Sequelize.STRING,
                allowNull: true,
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
        await queryInterface.dropTable('users');
    },
};
