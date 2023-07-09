"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class HashTags extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsToMany(models.Posts, {
                through: "Posts_Tags",
                foreignKey: "tagId",
                otherKey: "postId",
            });
        }
    }
    HashTags.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                type: DataTypes.INTEGER,
            },
            tagContent: {
                allowNull: false,
                type: DataTypes.STRING,
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
            modelName: "HashTags",
        }
    );
    return HashTags;
};
