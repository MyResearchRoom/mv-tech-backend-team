'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("companyGstRegistrations", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
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
      gstin: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      state: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      gstRegistrationStatus: {
        type: Sequelize.ENUM("Registered", "Unregistered"),
        defaultValue: "Registered",
        allowNull: true,
      },
      gstRegistrationType: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      taxCalculationPreference: {
        type: Sequelize.ENUM("Exclusive", "Inclusive"),
        defaultValue: "Exclusive",
        allowNull: true,
      },
      defaultGstConfiguration: {
        type: Sequelize.STRING(60),
        allowNull: true,
      },
      defaultPlaceOfSupply: {
        type: Sequelize.STRING(60),
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
    await queryInterface.dropTable("companyGstRegistrations");
  },
};
