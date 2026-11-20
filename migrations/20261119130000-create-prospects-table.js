'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("prospects", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      prospectCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      prospectType: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      companyName: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      contactPerson: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      alternateContact: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      website: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      gstin: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      pan: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      registeredAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(80),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(80),
        allowNull: true,
      },
      pinCode: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(60),
        allowNull: true,
        defaultValue: "India",
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "PROSPECT_CREATED",
          "DRAWINGS_RECEIVED",
          "DRAWINGS_UPLODED",
          "ESTIMATION_IN_PROGRESS",
          "ESTIMATION_COMPLETED",
          "BOQ_PREPARED",
          "BOQ_SHARED",
          "FEEDBACK_RECEIVED",
          "BOQ_APPROVED",
          "CONVERTED"
        ),
        allowNull: false,
        defaultValue: "PROSPECT_CREATED",
      },
      convertedClientId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
      },
      convertedProjectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
      },
      convertedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      convertedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("prospects", ["status"]);
    await queryInterface.addIndex("prospects", ["mobile"]);
    await queryInterface.addIndex("prospects", ["email"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("prospects");
  },
};
