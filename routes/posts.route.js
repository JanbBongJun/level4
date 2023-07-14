const express = require("express");
const router = express.Router();
const {authMiddlewareHTTP} = require("../middleware/auth.middleware.js");
const PostController = require("../controllers/posts.controller.js");
const postController = new PostController();

//게시글 생성
router.post(
    "/posts",
    async (req, res, next) => {
        await authMiddlewareHTTP(["id"], req, res, next);
    },
    postController.createPost
);

//게시글 수정
router.put(
    "/posts/:id",
    async (req, res, next) => {
        await authMiddlewareHTTP(["id"], req, res, next);
    },
    postController.modifyPost
);

//게시글 삭제
router.delete(
    "/posts/:id",
    async (req, res, next) => {
        await authMiddlewareHTTP(["id"], req, res, next);
    },
    postController.dsetroyPost
);

//게시글 목록 조회
router.get("/posts", postController.findAllPosts);

//게시글 상세조회
router.get("/posts/:id", postController.findOnePosts);

module.exports = router;
