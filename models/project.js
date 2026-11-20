const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Project extends Model {
        static associate(models) {
            Project.belongsTo(models.Company, {
                foreignKey: 'companyId',
                as: 'company',
            });

            Project.belongsTo(models.Client, { 
                foreignKey: 'clientId', as: 'client' 
            });

            Project.belongsTo(models.Prospect, { 
                foreignKey: 'sourceProspectId', as: 'sourceProspect' 
            });

            Project.belongsTo(models.User, { 
                foreignKey: 'projectManagerId', as: 'projectManager' 
            });

            Project.belongsTo(models.User, { 
                foreignKey: 'createdBy', as: 'creator' 
            });

            Project.hasMany(models.Document, {
                foreignKey: 'ownerId', constraints: false, as: 'documents',
                scope: { ownerType: 'project' }
            });
            Project.hasMany(models.ActivityLog, {
                foreignKey: 'entityId', constraints: false, as: 'activities',
                scope: { entityType: 'project' }
            });
        }
    }

    Project.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            projectCode: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true                // PRJ-MVT-001
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            clientId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            sourceProspectId: {
                type: DataTypes.INTEGER,
                allowNull: true,            // null for projects added directly on a client
                unique: true
            },

            // Copied from prospect_projects
            projectName: {
                type: DataTypes.STRING(200),
                allowNull: false
            },
            projectType: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            projectLocation: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            constructionStatus: {
                type: DataTypes.STRING,
                allowNull: true
            },
            builtUpArea: {
                type: DataTypes.DECIMAL(12, 2),     // sq ft
                allowNull: true
            },
            towers: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            floors: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            basements: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            siteAddress: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            fireAuthority: {
                type: DataTypes.STRING(150),
                allowNull: true
            },
            fireRequirements: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            // Execution side (set after conversion)
            status: {
                type: DataTypes.ENUM(
                    "MOBILISATION",
                    "DESIGN",
                    "EXECUTION",
                    "TESTING_COMMISSIONING",
                    "HANDOVER",
                    "COMPLETED",
                    "ON_HOLD",
                    "CANCELLED"
                ),
                allowNull: false,
                defaultValue: "MOBILISATION"
            },
            contractStartDate: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            targetCompletionDate: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            actualCompletionDate: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },

            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
        },
        {
            sequelize,
            modelName: "Project",
            tableName: "projects",
            timestamps: true,
            indexes: [
                { fields: ['companyId'] },
                { fields: ['clientId'] },
                { fields: ['status'] },
                { fields: ['projectType'] }
            ]
        }
    );

    return Project;
};