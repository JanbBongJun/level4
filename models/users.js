"use strict";
const { Model } = require("sequelize");
const MakeError = require("../utils/error.utils.js");
const bcrypt = require("bcrypt");
const saltRounds = 11;
module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.hasMany(models.Posts, {
                sourceKey: "id",
                foreignKey: "userId",
            });
            this.hasMany(models.Comments, {
                sourceKey: "id",
                foreignKey: "userId",
            });
            this.belongsToMany(models.Posts, {
                through: "Likes",
                foreignKey: "userId",
                otherKey: "postId",
            });
            this.belongsToMany(models.ChattingRooms, {
                through: "Messages",
                foreignKey: "userId",
                otherKey: "roomId",
            });
            this.belongsToMany(models.ChattingRooms, {
                through: "Room_User",
                foreignKey: "userId",
                otherKey: "roomId",
            });
        }
    }
    Users.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                type: DataTypes.INTEGER,
            },
            email: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING,
                validate: {
                    isEmail:true,
                    notEmpty:true,
                },
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING,
                validate:{
                    notEmpty:true,
                    len:[2,7]
                }
            },
            nickname: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING,
                validate: {
                    notEmpty: true,
                    len:[2,8]
                },
            },
            TMI: {
                allowNull: true,
                type: DataTypes.STRING,
                validate:{
                    len:[0,30]
                }
                
            },
            password: {
                allowNull: false,
                type: DataTypes.STRING,
                validate:{
                    notEmpty:true
                },
                set(value) {
                    const pw_validation =
                        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
                    if (!pw_validation.test(value)) {
                        const err = new MakeError(
                            "비밀번호는 영어, 숫자, 특수문자를 포함하여 8~15자로 구성해주세요",
                            401,
                            "password validation err"
                        );
                        throw err;
                    }
                    const hashedPassword = bcrypt.hashSync(value, saltRounds);
                    this.setDataValue("password", hashedPassword);
                },
            },
            refreshToken: {
                type: DataTypes.STRING,
            },
            isOnline: {
                allowNull: false,
                defaultValue: false,
                type: DataTypes.BOOLEAN,
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
            modelName: "Users",
        }
    );
    return Users;
};
