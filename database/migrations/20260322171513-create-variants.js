'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
      up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('variants', {
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
                type: Sequelize.STRING(100),
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
                defaultValue: 0,
            },

            price: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },

            sku: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
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
        await queryInterface.dropTable('variants');
    },
};
