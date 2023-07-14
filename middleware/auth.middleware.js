const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/users.repository");
const tokenKey = "level4";
const cookieParser = require("cookie-parser");

const authMiddlewareHTTP = async (userInfoArr,req, res, next) => {
    try {
      const accessToken = req.cookies.accessToken;
      const refreshToken = req.cookies.refreshToken;
      if (!accessToken || !refreshToken) throw new Error();
  
      const userAndToken = await verifyAllToken(
        jwt,
        tokenKey,
        userInfoArr,
        accessToken,
        refreshToken
      );
  
      res.cookie("accessToken", userAndToken.accessToken);
      res.locals.user = userAndToken.user;
      next();
    } catch (err) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(400).json({ message: "로그인이 필요한 기능입니다" });
    }
  };
  
  const authMiddlewareSocket = async (userInfoArr,socket) => {
    try {
      let cookieValues = socket.handshake.headers.cookie;
      let parsedCookies = cookieParser.parse(cookieValues);
      let accessToken = parsedCookies.accessToken;
      let refreshToken = parsedCookies.refreshToken;
  
      if (!accessToken || !refreshToken) throw new Error();
  
      const userAndToken = await verifyAllToken(
        jwt,
        tokenKey,
        userInfoArr,
        accessToken,
        refreshToken
      );
  
      return userAndToken.user;
    } catch (err) {
      return false;
    }
  };
  
function getAccessTokenPayload(jwt, tokenKey, accessToken) {
    try {
        const payload = jwt.verify(accessToken, tokenKey); // JWT에서 Payload를 가져옵니다.
        return payload;
    } catch (error) {
        return { email: null };
    }
}

function verifyRefreshToken(jwt, tokenKey, refreshToken) {
    jwt.verify(refreshToken, tokenKey);
}

async function verifyAllToken(
    jwt,
    tokenKey,
    userInfoArr,
    accessToken,
    refreshToken
) {
    verifyRefreshToken(jwt, tokenKey, refreshToken);

    const userRepository = new UserRepository();
    const { email } = getAccessTokenPayload(jwt, tokenKey, accessToken);
    let user;

    if (email) {
        user = await userRepository.findOneUser({
            where: { email, refreshToken },
            attributes: userInfoArr.concat("refreshToken"),
        });
        if (!user) {
            throw new Error();
        }
        return { accessToken, user };
    } else {
        user = await userRepository.findOneUser({
            where: { refreshToken },
            attributes: userInfoArr.concat("refreshToken"),
        });

        if (!user) {
            throw new Error();
        }

        const newAccessToken = jwt.sign({ email: user.email }, tokenKey, {
            expiresIn: "2h",
        });

        return { accessToken: newAccessToken, user };
    }
}

module.exports = {authMiddlewareHTTP, authMiddlewareSocket};
