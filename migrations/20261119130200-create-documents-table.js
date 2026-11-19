'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("documents", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ownerType: {
        type: Sequelize.ENUM("prospect", "client", "project"),
        allowNull: false,
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM("Drawing", "Site Photo", "Document", "Other"),
        allowNull: true,
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      document: {
        type: Sequelize.BLOB("long"),
        allowNull: false,
      },
      documentContentType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      remarks: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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

    await queryInterface.addIndex("documents", ["ownerType", "ownerId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("documents");
  },
};
