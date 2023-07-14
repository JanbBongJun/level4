"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Messages extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Messages.init(
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
                validate:{
                    isNumeric:{msg:'잘못된 userId 형식입니다'}
                }
            },
            roomId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "ChattingRooms",
                    key: "id",
                },
                onDelete: "CASCADE",
                validate:{
                    isNumeric:{msg:'잘못된 roomId 형식입니다'}
                }
            },
            message: {
                allowNull: false,
                type: DataTypes.STRING,
                validate:{
                    len:{args:[1,400],msg:"1글자 이상 400글자 이내로 작성해주세요"}
                }
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
            modelName: "Messages",
        }
    );
    return Messages;
};
