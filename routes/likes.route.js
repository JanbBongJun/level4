const express = require("express");
const router = express.Router();
const LikeController = require("../controllers/likes.controllers");
const likeController = new LikeController();
const {authMiddlewareHTTP} = require("../middleware/auth.middleware.js");

//좋아요 누르기
router.post(
    "/posts/:postId/likes",
    async (req, res, next) => {
        await authMiddlewareHTTP(["id"], req, res, next);
    },
    likeController.pressLike
);

//좋아요 게시글 조회
router.get(
    "/users/likes",
    async (req, res, next) => {
        await authMiddlewareHTTP(["id"], req, res, next);
    },
    likeController.getLikedPost
);

module.exports = router