const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ActivityLog extends Model {
        static associate(models) {
            
        }
    }

    ActivityLog.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            entityType: {
                type: DataTypes.ENUM("prospect", "client", "project"),
                allowNull: false
            },
            entityId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            action: {
                type: DataTypes.STRING(50),         // CREATED, BOQ_SHARED, CONVERTED...
                allowNull: false
            },
            details: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
        },
        {
            sequelize,
            modelName: "ActivityLog",
            tableName: "activity_log",
            timestamps: true,
            updatedAt: false,                       
            indexes: [
                { fields: ['entityType', 'entityId'] }
            ]
        }
    );

    return ActivityLog;
};