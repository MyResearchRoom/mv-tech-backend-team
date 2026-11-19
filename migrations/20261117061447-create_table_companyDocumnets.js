'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("company_documents", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      documentName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      documentKey: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      isAdditional: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      document: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },
      documentContentType: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("company_documents");
  },
};
