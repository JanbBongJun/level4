const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comments.controller.js");
const commentController = new CommentController();
const authMiddleware = require("../middleware/auth.middleware.js");

//댓글 생성
router.post(
    "/posts/:postId/comments",
    async (req, res, next) => {
        await authMiddleware(["id"], req, res, next);
    },
    commentController.createComment
);

//댓글 수정
router.put(
    "/posts/:postId/comments/:id",
    async (req, res, next) => {
        await authMiddleware(["id"], req, res, next);
    },
    commentController.modifyComment
);

//댓글 삭제
router.delete(
    "/posts/:postId/comments/:id",
    async (req, res, next) => {
        await authMiddleware(["id"], req, res, next);
    },
    commentController.destroyComment
);

//댓글 불러오기
router.get(
    "/posts/:postId/comments",
    commentController.findAllComment
);

module.exports = router
