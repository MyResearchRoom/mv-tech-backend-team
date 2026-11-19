"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CompanyDocument extends Model {
    static associate(models) {
      CompanyDocument.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  CompanyDocument.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      documentName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      documentKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      isAdditional: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      document: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },

      documentContentType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CompanyDocument",
      tableName: "company_documents",
      timestamps: true,
    }
  );

  return CompanyDocument;
};