
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM(
          "ADMIN",
          "DESIGN HEAD",
          "INVENTORY MANAGER",
          "PROJECT MANAGER",
          "ACCOUNT MANAGER",
          "CLIENT MANAGER",
        ),
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      gender: {
        type: Sequelize.ENUM("male", "female"),
        allowNull: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      profile: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },

      profileContentType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");

  },
};
