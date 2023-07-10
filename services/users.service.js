const UserRepository = require("../repositories/users.repository.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const MakeError = require("../utils/error.utils.js");
const { sequelize, Users } = require("../models");
const {
    TransactionManager,
    Transaction,
} = require("./transactionManager.service.js");
const tokenKey = "level4";


class UserService {
    //회원가입
    async signUp(userInfo) {
        const userRepository = new UserRepository();
        const {confirmPassword, TMI } =
            userInfo;
        const email = userInfo.email.trim()
        const name = userInfo.name.trim()
        const nickname = userInfo.nickname.trim()
        const password = userInfo.password.trim()

        const userInfos = { name, nickname, email, password, TMI };
        const isolationLevel = Transaction.ISOLATION_LEVELS.READ_COMMITTED;
        const transactionManager = await TransactionManager(sequelize, {
            isolationLevel,
        });
        try {
            if (!password) {
                const err = new MakeError(
                    "password not found",
                    401,
                    "password validate err"
                );
                throw err;
            } else if (confirmPassword !== password) {
                const err = new MakeError(
                    "password is not correspond",
                    401,
                    "confirmPassword correspond err"
                );
                throw { err };
            }
            

            const transaction = transactionManager.getTransaction();
            const userOptions = {
                transaction,
            }; //validate를 통해서 유효성검사를 진행
            const user = await userRepository.createUser(
                userInfos,
                userOptions
            );
            if (!user) {
                const err = new MakeError(
                    "failed to signUp",
                    412,
                    "failed to signUp"
                );
                throw err;
            }
            await transactionManager.commitTransaction();
            return;
        } catch (err) {
            
            await transactionManager.rollbackTransaction();
            throw err;
        }
    }

    //로그인
    async login(authObj) {
        const userRepository = new UserRepository();
        const { email, password } = authObj;

        const error = new MakeError(
            "로그인 또는 패스워드를 다시 확인해주세요",
            400,
            "authorization err"
        );
        try {
            //로그인 정보를 받아온 후 db에서 PW가져오기
            //email정보를 jwt에 담아서 전달 , accessToken,refreshToken,tokenKey ="level4"
            const user = await userRepository.findOneUser({
                where: { email },
                attributes: ["password", "id"],
            });

            if (!user || !password) {
                throw error;
            }
            const isValidPassword = bcrypt.compareSync(password, user.password);
            if (!isValidPassword) {
                throw error;
            }
            const accessToken = jwt.sign({ email }, tokenKey, {
                expiresIn: "2h",
            });

            const refreshToken = jwt.sign({}, tokenKey, { expiresIn: "14d" });
            user.refreshToken = refreshToken;
            await user.save(); //PK가 있어야 찾을 수 있음

            return { accessToken, refreshToken };
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    async updatePassword() {}
    async updateUserInfo() {} //유저정보 수정
    async destroyUser() {}
}

module.exports = UserService;
