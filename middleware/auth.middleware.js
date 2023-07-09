const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/users.repository");
const tokenKey = "level4";

const authMiddleware = async (userInfoArr, req, res, next) => {
    try {
        const { accessToken, refreshToken } = req.cookies;
        if (!accessToken) {
            return res
                .status(400)
                .json({ message: "로그인이 필요한 기능입니다" });
        } else if (!refreshToken) {
            return res
                .status(400)
                .json({ message: "로그인이 필요한 기능입니다" });
        }

        jwt.verify(refreshToken, tokenKey);
        const { email } = getAccessTokenPayload(accessToken)
        const userRepository = new UserRepository();
        const user = await userRepository.findOneUser({
            where: { email },
            attributes: userInfoArr.concat("refreshToken"),
        });
        
        if (!user.refreshToken === refreshToken) {
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return res
                .status(400)
                .json({ message: "로그인이 필요한 기능입니다" });
        }
        res.locals.user = user;
        next();
    } catch (err) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(400).json({ message: "로그인이 필요한 기능입니다" });
    }
};

function getAccessTokenPayload(accessToken) {
    try {
      const payload = jwt.verify(accessToken, tokenKey); // JWT에서 Payload를 가져옵니다.
      return payload;
    } catch (error) {
      return null;
    }
  }

module.exports = authMiddleware;
