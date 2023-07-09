const express = require("express");
const router = express.Router();
const UsersController = require("../controllers/users.controller.js");
const usersController = new UsersController();

//회원가입
router.post("/user/signUp", usersController.signUp);

//로그인
router.post("/user/login", usersController.login);

module.exports = router;
