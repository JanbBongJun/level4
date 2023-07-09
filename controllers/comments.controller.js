const CommentService = require("../services/comments.service.js");

class CommentController {
    constructor() {
        this.commentService = new CommentService();
    }

    createComment = async (req, res) => {
        const { commentContent } = req.body;
        const { postId } = req.params;
        const userId = res.locals.user.id;
        try {
            await this.commentService.createComment({
                commentContent,
                postId,
                userId,
            });
            return res
                .status(200)
                .json({ message: "댓글을 성공적으로 작성하였습니다" });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else {
                return res
                    .status(412)
                    .json({ message: "댓글작성에 실패하였습니다" });
            }
        }
    };
    modifyComment = async (req, res) => {
        const { id } = req.params;
        const { commentContent } = req.body;
        const userId = res.locals.user.id;
        try {
            await this.commentService.modifyComment({
                id,
                commentContent,
                userId,
            });
            return res
                .status(200)
                .json({ message: "댓글을 성공적으로 수정하였습니다" });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else {
                return res
                    .status(412)
                    .json({ message: "댓글 수정에 실패하였습니다" });
            }
        }
    };
    destroyComment = async (req, res) => {
        const userId = res.locals.user.id;
        const { id } = req.params;
        try {
            await this.commentService.destroyComment({ userId, id });
            return res
                .status(200)
                .json({ message: "댓글을 성공적으로 삭제하였습니다" });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else {
                return res
                    .status(412)
                    .json({ message: "댓글 삭제에 실패하였습니다" });
            }
        }
    };
    findAllComment = async (req, res) => {
        const { postId } = req.params;
        const { commentPageNum, commentPageSize } = req.query;
        try {
            const comments = await this.commentService.findAllComment(
                postId,
                commentPageNum,
                commentPageSize
            );
            return res.status(200).json({ comments });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else {
                return res
                    .status(412)
                    .json({ message: "댓글불러오기를 실패하였습니다" });
            }
        }
    };
}
module.exports = CommentController;
