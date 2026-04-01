'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('products', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        product_name: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        thumbnail_public_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        thumbnail_url: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        category: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        status: {
            type: Sequelize.ENUM('active', 'deleted'),
            allowNull: false,
            defaultValue: 'active',
        },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('products');
    },
};
