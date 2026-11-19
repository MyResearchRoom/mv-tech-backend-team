'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      projectCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      sourceProspectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: "prospects",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      projectName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      projectType: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      projectLocation: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      constructionStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      builtUpArea: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      towers: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      floors: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      basements: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      siteAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fireAuthority: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      fireRequirements: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "MOBILISATION",
          "DESIGN",
          "EXECUTION",
          "TESTING_COMMISSIONING",
          "HANDOVER",
          "COMPLETED",
          "ON_HOLD",
          "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "MOBILISATION",
      },
      contractStartDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      targetCompletionDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      actualCompletionDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      projectManagerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
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

    await queryInterface.addIndex("projects", ["clientId"]);
    await queryInterface.addIndex("projects", ["status"]);
    await queryInterface.addIndex("projects", ["projectType"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("projects");
  },
};
