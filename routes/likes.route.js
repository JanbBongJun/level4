const express = require("express");
const router = express.Router();
const LikeService = require("../controllers/likes.controllers");
const likeService = new LikeService();
const authMiddleware = require("../middleware/auth.middleware.js");

//좋아요 누르기
router.post(
    "/posts/:postId/likes",
    async (req, res, next) => {
        await authMiddleware(["id"], req, res, next);
    },
    likeService.pressLike
);

//좋아요 게시글 조회
router.get(
    "/users/likes",
    async (req, res, next) => {
        await authMiddleware(["id"], req, res, next);
    },
    likeService.getLikedPost
);

module.exports = router