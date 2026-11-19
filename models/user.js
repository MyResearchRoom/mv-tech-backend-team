const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            role: {
                type: DataTypes.ENUM(
                    "ADMIN",
                    "DESIGN HEAD",
                    "INVENTORY MANAGER",
                    "PROJECT MANAGER",
                    "ACCOUNT MANAGER",
                    "CLIENT MANAGER",
                ),
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            mobileNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            gender: {
                type: DataTypes.ENUM('male', 'female'),
                allowNull: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            profile: {
                type: DataTypes.BLOB('long'),
                allowNull: true
            },
            profileContentType: {
                type: DataTypes.STRING,
                allowNull: true
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
          
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: true
        }
    );

    return User;
}