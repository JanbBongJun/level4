"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Users", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                type: Sequelize.INTEGER,
            },
            email: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING,
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            nickname: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING,
            },
            TMI: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            password: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            refreshToken: {
                type: Sequelize.STRING,
            },
            isOnline: {
                allowNull: false,
                defaultValue: false,
                type: Sequelize.BOOLEAN,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("now"),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("now"),
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Users");
    },
};
