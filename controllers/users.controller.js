const UserService = require("../services/users.service.js");

class UsersController {
    async signUp(req, res) {
        const userService = new UserService();
        const { name, nickname, TMI, email, password, confirmPassword } =
            req.body;

        try {
            await userService.signUp({ name, nickname, TMI, email, password, confirmPassword });
            return res
                .status(200)
                .json({ message: "회원가입이 완료되었습니다" });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else if (err.errors) {
                let messages = [];
                err.errors.forEach((err) => {
                    messages.push(err.message)
                });
                return res.status(406).json({'messages':messages});
            } 
            return res.status(406).json({ message: "failed to signUp" });
        }
    }
    async login(req, res) {
        const userService = new UserService();

        const { email, password } = req.body;
        try {
            const { accessToken, refreshToken } = await userService.login({
                email,
                password,
            });
            res.cookie("accessToken", accessToken);
            res.cookie("refreshToken", refreshToken);
            return res
                .status(200)
                .json({ message: "로그인에 성공하였습니다." });
        } catch (err) {
            if (err.code === 400) {
                return res.status(400).json({
                    message: "로그인 또는 패스워드를 다시 확인해주세요",
                });
            }
            return res.status(412).json({ message: "로그인에 실패하였습니다" });
        }
    }
}

module.exports = UsersController;
