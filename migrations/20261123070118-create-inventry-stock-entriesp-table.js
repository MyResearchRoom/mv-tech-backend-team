
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('inventry_stock_entries', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            entryNo: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true
            },

            itemId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'inventory_items',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },

            entryDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },

            quantity: {
                type: Sequelize.DECIMAL(14, 3),
                allowNull: false
            },

            rate: {
                type: Sequelize.DECIMAL(14, 2),
                allowNull: false,
                defaultValue: 0
            },

            amount: {
                type: Sequelize.DECIMAL(16, 2),
                allowNull: false,
                defaultValue: 0
            },

            supplierName: {
                type: Sequelize.STRING(200),
                allowNull: true
            },


            remarks: {
                type: Sequelize.TEXT,
                allowNull: true
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

        await queryInterface.addIndex('inventry_stock_entries', ['entryDate']);
        await queryInterface.addIndex('inventry_stock_entries', ['itemId']);
        await queryInterface.addIndex('inventry_stock_entries', ['supplierName']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('inventry_stock_entries');
    }
};
