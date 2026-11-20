'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = ["prospects", "clients", "projects"];

    for (const table of tables) {
      await queryInterface.addColumn(table, "companyId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
      await queryInterface.addIndex(table, ["companyId"], {
        name: `idx_${table}_company_id`,
      });
      await queryInterface.addConstraint(table, {
        fields: ["companyId"],
        type: "foreign key",
        name: `fk_${table}_company_id`,
        references: {
          table: "companies",
          field: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface) {
    const tables = ["prospects", "clients", "projects"];

    for (const table of tables) {
      await queryInterface.removeConstraint(table, `fk_${table}_company_id`);
      await queryInterface.removeIndex(table, `idx_${table}_company_id`);
      await queryInterface.removeColumn(table, "companyId");
    }
  },
};
