"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Posts_Tags extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Posts_Tags.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                type: DataTypes.INTEGER,
            },
            postId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "Posts",
                    key: "id",
                },
                onDelete:'CASCADE'
            },
            tagId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "HashTags",
                    key: "id",
                },
                onDelete:'CASCADE'
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
            modelName: "Posts_Tags",
        }
    );
    return Posts_Tags;
};
