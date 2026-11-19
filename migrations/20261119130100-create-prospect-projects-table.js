'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("prospect_projects", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      prospectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "prospects",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      projectName: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      projectType: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      projectLocation: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      projectStatus: {
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
      expectedTimeline: {
        type: Sequelize.STRING(100),
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
    await queryInterface.dropTable("prospect_projects");
  },
};
