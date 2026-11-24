
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class InventoryItem extends Model {
        static associate(models) {
            InventoryItem.belongsTo(models.User, {
                foreignKey: 'createdBy',
                as: 'createdByUser'
            });

            InventoryItem.hasMany(models.InventryStockEntry, {
                foreignKey: 'itemId',
                as: 'stockEntries'
            });
        }
    }

    InventoryItem.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            itemCode: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },

            name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            company: DataTypes.STRING(150),

            hsnCode: DataTypes.STRING(20),

            category: DataTypes.STRING(150),

            itemGroup: DataTypes.STRING(100),

            itemType: DataTypes.STRING(100),

            barcode: DataTypes.STRING(100),

            rackBox: DataTypes.STRING(100),

            
            unit: {
                type: DataTypes.STRING(50),
                allowNull: false
            },

            price: {
                type: DataTypes.DECIMAL(14, 2),
                allowNull: false,
                defaultValue: 0
            },

            reorderLevel: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            currentStock: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },

            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },

            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'InventoryItem',
            tableName: 'inventory_items',
            timestamps: true
        }
    );

    return InventoryItem;
};
