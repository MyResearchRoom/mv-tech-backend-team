const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ProspectProject extends Model {
        static associate(models) {
            ProspectProject.belongsTo(
                models.Prospect, 
                { foreignKey: 'prospectId', as: 'prospect' });
        }
    }

    ProspectProject.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            prospectId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            projectName: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            projectType: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            projectLocation: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            projectStatus: {
                type: DataTypes.STRING,
                allowNull: true
            },
            builtUpArea: {
                type: DataTypes.DECIMAL(12, 2),     
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
            expectedTimeline: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            fireAuthority: {
                type: DataTypes.STRING(150),
                allowNull: true
            },
            fireRequirements: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: "ProspectProject",
            tableName: "prospect_projects",
            timestamps: true,
   
        }
    );

    return ProspectProject;
};