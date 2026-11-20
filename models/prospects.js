const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Prospect extends Model {
        static associate(models) {
            Prospect.belongsTo(models.Company, {
                foreignKey: 'companyId', as: 'company'
            });

            Prospect.belongsTo(models.User, { 
                foreignKey: 'convertedBy', as: 'convertor' 
            });

            Prospect.belongsTo(models.User, { 
                foreignKey: 'createdBy', as: 'creator' 
            });

            Prospect.hasMany(models.ProspectProject, {
                foreignKey: 'prospectId', as: 'project', onDelete: 'CASCADE'
            });


            Prospect.hasMany(models.Document, {
                foreignKey: 'ownerId', constraints: false, as: 'documents',
                scope: { ownerType: 'prospect' }
            });

            Prospect.hasMany(models.ActivityLog, {
                foreignKey: 'entityId', constraints: false, as: 'activities',
                scope: { entityType: 'prospect' }
            });

            Prospect.belongsTo(models.Client,  { 
                foreignKey: 'convertedClientId',  as: 'convertedClient',  constraints: false 
            });

            Prospect.belongsTo(models.Project, { 
                foreignKey: 'convertedProjectId', as: 'convertedProject', constraints: false 
            });
        }
    }

    Prospect.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            prospectCode: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true          
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            prospectType: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            companyName: {
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
            remarks: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            // Workflow
            status: {
                type: DataTypes.ENUM(
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
                defaultValue: "PROSPECT_CREATED"
            },

            convertedClientId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                unique: true
            },
            convertedProjectId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                unique: true
            },
            convertedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            //point to user table
            convertedBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            //point to user table
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            
        },
        {
            sequelize,
            modelName: "Prospect",
            tableName: "prospects",
            timestamps: true,
            indexes: [
                { fields: ['companyId'] },
                { fields: ['status'] },
                { fields: ['mobile'] },
                { fields: ['email'] }
            ]
        }
    );

    return Prospect;
};