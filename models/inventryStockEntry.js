
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class InventryStockEntry extends Model {
        static associate(models) {
            InventryStockEntry.belongsTo(models.InventoryItem, {
                foreignKey: 'itemId',
                as: 'item'
            });

            InventryStockEntry.belongsTo(models.User, {
                foreignKey: 'createdBy',
                as: 'createdByUser'
            });
        }
    }

    InventryStockEntry.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            entryNo: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true
            },

            itemId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            entryDate: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },

            quantity: {
                type: DataTypes.DECIMAL(14, 3),
                allowNull: false
            },

            rate: {
                type: DataTypes.DECIMAL(14, 2),
                allowNull: false,
                defaultValue: 0
            },

            amount: {
                type: DataTypes.DECIMAL(16, 2),
                allowNull: false,
                defaultValue: 0
            },

            supplierName: DataTypes.STRING(200),

        
            remarks: DataTypes.TEXT,

            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'InventryStockEntry',
            tableName: 'inventry_stock_entries',
            timestamps: true
        }
    );

    return InventryStockEntry;
};
