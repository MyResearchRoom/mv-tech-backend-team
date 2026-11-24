
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('inventory_items', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            itemCode: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },

            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },

            company: {
                type: Sequelize.STRING(150),
                allowNull: true
            },

            hsnCode: {
                type: Sequelize.STRING(20),
                allowNull: true
            },

            category: {
                type: Sequelize.STRING(150),
                allowNull: true
            },

            itemGroup: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            itemType: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            barcode: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            rackBox: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            unit: {
                type: Sequelize.STRING(50),
                allowNull: false
            },

            reorderLevel: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            currentStock: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },

            createdBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex('inventory_items', ['name']);
        await queryInterface.addIndex('inventory_items', ['barcode']);
        await queryInterface.addIndex('inventory_items', ['hsnCode']);
        await queryInterface.addIndex('inventory_items', ['category']);
        await queryInterface.addIndex('inventory_items', ['company']);
        await queryInterface.addIndex('inventory_items', ['active']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('inventory_items');
    }
};
