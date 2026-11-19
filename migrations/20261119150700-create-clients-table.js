'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("clients", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      clientCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      clientType: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      name: {
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
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
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

    await queryInterface.addIndex("clients", ["status"]);
    await queryInterface.addIndex("clients", ["gstin"]);
    await queryInterface.addIndex("clients", ["pan"]);
    await queryInterface.addIndex("clients", ["mobile"]);
    await queryInterface.addIndex("clients", ["email"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("clients");
  },
};
