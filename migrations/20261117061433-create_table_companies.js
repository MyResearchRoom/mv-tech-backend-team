'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("companies", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      companyCode: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      companyName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      companyType: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("Active", "Inactive"),
        defaultValue: "Active",
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      logo: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },
      logoContentType: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      legalRegisteredName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      pan: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },
      cinLlpIN: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      registrationNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      esiNumber: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      pfNumber: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      iec: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      dateOfIncorporation: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      registeredOfficeAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      pinCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      
      primaryContactPerson: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      officialEmail: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      mobileNumber: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      financeContact: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      financeEmail: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      financeMobile: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      financialYearStart: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      baseCurrency: {
        type: Sequelize.STRING(5),
        defaultValue: "INR",
        allowNull: false,
      },
      invoicePrefix: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      quotationPrefix: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      purchaseOrderPrefix: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      defaultPaymentTerms: {
        type: Sequelize.STRING(60),
        allowNull: true,
      },
      bankName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      accountHolderName: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      accountNumber: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      ifscCode: {
        type: Sequelize.STRING(11),
        allowNull: true,
      },
      bankAddress: {
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
    await queryInterface.dropTable("companies");
  },
};
