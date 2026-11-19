const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Document extends Model {
        static associate(models) {
            Document.belongsTo(models.User, { 
                foreignKey: 'uploadedBy', as: 'uploader' 
            });
        }
    }

    Document.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            ownerType: {
                type: DataTypes.ENUM("prospect", "client", "project"),
                allowNull: false
            },
            ownerId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            category: {
                type: DataTypes.ENUM("Drawing", "Site Photo", "Document", "Other"),
                allowNull: true,
            },
            fileName: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            document: {
                type: DataTypes.BLOB('long'),
                allowNull: false
            },
            documentContentType: {
                type: DataTypes.STRING,
                allowNull: true
            },

            version: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            
            remarks: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            //point to user table

            uploadedBy: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Document",
            tableName: "documents",
            timestamps: true,
            indexes: [
                { fields: ['ownerType', 'ownerId'] },
                { unique: true, fields: ['ownerType', 'ownerId', 'fileName', 'version'] }
            ]
        }
    );

    return Document;
};