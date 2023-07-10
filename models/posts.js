"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Posts extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Users, {
                targetKey: "id",
                foreignKey: "userId",
            });
            this.hasMany(models.Comments, {
                sourceKey: "id",
                foreignKey: "postId",
            });
            this.belongsToMany(models.Users, {
                through: "Likes",
                foreignKey: "postId",
                otherKey: "userId",
            });
            this.belongsToMany(models.HashTags, {
                through: "Pots_Tags",
                foreignKey: "postId",
                otherKey: "tagId",
            });
        }
    }
    Posts.init(
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
                onDelete: "CASCADE",
            },
            postTitle: {
                allowNull: false,
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [1, 30],
                        msg: "게시글 제목은 1~30글자로 작성해주세요",
                    },
                },
            },
            postContent: {
                allowNull: false,
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [1, 500],
                        msg: "게시글 내용은 1~500글자로 작성해주세요",
                    },
                },
            },
            viewCount: {
                allowNull: false,
                defaultValue: 0,
                type: DataTypes.INTEGER,
            },
            likeCount: {
                allowNull: false,
                defaultValue: 0,
                type: DataTypes.INTEGER,
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
            modelName: "Posts",
        }
    );
    return Posts;
};
