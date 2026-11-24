'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('inventory_items', 'price', {
            type: Sequelize.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
            after:"unit",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('inventory_items', 'price');
    }
};
