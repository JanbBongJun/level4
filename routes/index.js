const express = require("express");
const router = express.Router();

const userRouter = require("./users.route.js");
const postRouter = require("./posts.route.js");
const commentRouter = require("./comments.route.js");
const likeRouter = require("./likes.route.js")

router.use("/api", userRouter);
router.use("/api", postRouter);
router.use("/api", commentRouter);
router.use("/api",likeRouter)

module.exports = router;
