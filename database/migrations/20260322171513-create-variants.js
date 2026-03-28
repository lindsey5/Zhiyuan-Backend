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
                references: { model: 'products', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
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
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },

            status: {
                type: Sequelize.ENUM('active', 'inactive'),
                allowNull: false,
                defaultValue: 'active'
            }
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.dropTable("variants");
    }
};
