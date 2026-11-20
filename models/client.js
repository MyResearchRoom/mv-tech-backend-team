const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Client extends Model {
        static associate(models) {
            Client.belongsTo(models.Company, {
                foreignKey: 'companyId',
                as: 'company',
            });

            Client.belongsTo(models.User, { 
                foreignKey: 'createdBy', as: 'creator' 
            });

            Client.belongsTo(models.Prospect, { 
                foreignKey: 'sourceProspectId', as: 'sourceProspect' 
            });

            Client.hasMany(models.Project, { 
                foreignKey: 'clientId', as: 'projects' 
            });

            Client.hasMany(models.Document, {
                foreignKey: 'ownerId', constraints: false, as: 'documents',
                scope: { ownerType: 'client' }
            });

            Client.hasMany(models.ActivityLog, {
                foreignKey: 'entityId', constraints: false, as: 'activities',
                scope: { entityType: 'client' }
            });
        }
    }

    Client.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            clientCode: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true                
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            clientType: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            contactPerson: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            designation: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            mobile: {
                type: DataTypes.STRING(20),
                allowNull: false
            },
            alternateContact: {
                type: DataTypes.STRING(20),
                allowNull: true
            },
            email: {
                type: DataTypes.STRING(150),
                allowNull: false,
                validate: { isEmail: true }
            },
            website: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            gstin: {
                type: DataTypes.STRING(15),
                allowNull: true
            },
            pan: {
                type: DataTypes.STRING(10),
                allowNull: true
            },
            registeredAddress: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            city: {
                type: DataTypes.STRING(80),
                allowNull: true
            },
            state: {
                type: DataTypes.STRING(80),
                allowNull: true
            },
            pinCode: {
                type: DataTypes.STRING(10),
                allowNull: true
            },
            country: {
                type: DataTypes.STRING(60),
                defaultValue: 'India'
            },
            sourceProspectId: {
                type: DataTypes.INTEGER,
                allowNull: true,            // null for clients created directly
                unique: true
            },
            status: {
                type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
                allowNull: false,
                defaultValue: "ACTIVE"
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            
        },
        {
            sequelize,
            modelName: "Client",
            tableName: "clients",
            timestamps: true,
            indexes: [
                { fields: ['companyId'] },
                { fields: ['status'] },
                { fields: ['gstin'] },
                { fields: ['pan'] },
                { fields: ['mobile'] },
                { fields: ['email'] },
            ]
        }
    );

    return Client;
};