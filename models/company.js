
const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.CompanyGstRegistration, {
        foreignKey: "companyId",
        as: "gstRegistrations",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Company.hasMany(models.CompanyDocument, {
        foreignKey: "companyId",
        as: "documents",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Company.hasMany(models.Prospect, {
        foreignKey: "companyId",
        as: "prospects",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      Company.hasMany(models.Client, {
        foreignKey: "companyId",
        as: "clients",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      Company.hasMany(models.Project, {
        foreignKey: "companyId",
        as: "projects",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  }

  Company.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      companyCode: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      companyName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      companyType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        defaultValue: "Active",
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logo: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      logoContentType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      // Legal & Registration Details
      legalRegisteredName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      pan: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      cinLlpIN: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      registrationNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      esiNumber: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      pfNumber: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      iec: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      dateOfIncorporation: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      registeredOfficeAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      pinCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      

      // Contact Details
      primaryContactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      officialEmail: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      mobileNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      financeContact: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      financeEmail: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      financeMobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },

      // Financial & Operational Settings
      financialYearStart: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      baseCurrency: {
        type: DataTypes.STRING(5),
        defaultValue: "INR",
        allowNull: false,
      },
      invoicePrefix: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      quotationPrefix: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      purchaseOrderPrefix: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      defaultPaymentTerms: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },

      // Bank Details
      bankName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      accountHolderName: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      accountNumber: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      ifscCode: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      bankAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Company",
      tableName: "companies",
      timestamps: true,
    }
  );

  return Company;
};
