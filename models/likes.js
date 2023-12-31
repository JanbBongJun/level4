"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Likes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Likes.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                type: DataTypes.INTEGER,
            },
            userId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "Users",
                    key: "id",
                },
                onDelete:'CASCADE',
            },
            postId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "Posts",
                    key: "id",
                },
                onDelete:'CASCADE',
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Likes",
        }
    );
    return Likes;
};
