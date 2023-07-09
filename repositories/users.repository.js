//직접 데이터를 가져오는 코드
const { Users } = require("../models");

class UserRepository {
    //User생성
    createUser = async (userInfo, userOptions) => {
        return await Users.create(userInfo, userOptions);
    };
    updateUser = async (NewUserInfo, userOptions) => {
        return await Users.update(NewUserInfo, userOptions);
    };
    destroyUser = async (userOptions) => {
        return await Users.destroy(userOptions);
    };
    findAllUser = async (userOptions) => {
        return await Users.findAll(userOptions);
    };
    findOneUser = async (userOptions) => {
        return await Users.findOne(userOptions);
    };
}

module.exports = UserRepository;
