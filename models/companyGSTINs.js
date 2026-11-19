
const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class CompanyGstRegistration extends Model {
    static associate(models) {
      CompanyGstRegistration.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
    }
  }

  CompanyGstRegistration.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      gstin: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      state: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gstRegistrationStatus: {
        type: DataTypes.ENUM("Registered", "Unregistered"),
        defaultValue: "Registered",
        allowNull: true,
      },
      gstRegistrationType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      taxCalculationPreference: {
        type: DataTypes.ENUM("Exclusive", "Inclusive"),
        defaultValue: "Exclusive",
        allowNull: true,
      },
      defaultGstConfiguration: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      defaultPlaceOfSupply: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CompanyGstRegistration",
      tableName: "companyGstRegistrations",
      timestamps: true,
    }
  );

  return CompanyGstRegistration;
};
