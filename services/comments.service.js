const { DataTypes, Op } = require("sequelize");
const { Users } = require("../models");
const MakeError = require("../utils/error.utils.js");
const CommentRepository = require("../repositories/comments.repository.js");

class CommentService {
    createComment = async (commentInfo) => {
        const { userId, postId, commentContent } = commentInfo;
        const commentRepository = new CommentRepository();
        try {
            if (!userId || isNaN(userId / 1)) {
                throw new MakeError(
                    "유효하지 않은 userId입니다",
                    401,
                    "invalid userId"
                );
            }
            if (isNaN(postId / 1)) {
                throw new MakeError(
                    "유효하지 않은 postId입니다",
                    401,
                    "invalid postId"
                );
            } else if (!commentContent || !commentContent.trim()) {
                throw new MakeError(
                    "댓글 내용을 입력해주세요",
                    401,
                    "invalid commentContent"
                );
            }
            await commentRepository.createComment({
                userId,
                postId,
                commentContent,
            });
            return;
        } catch (err) {
            throw err;
        }
    };

    modifyComment = async (commentInfo) => {
        const { id, userId, commentContent } = commentInfo;
        const commentRepository = new CommentRepository();
        try {
            if (!userId || isNaN(userId / 1)) {
                throw new MakeError(
                    "유효하지 않은 userId입니다",
                    401,
                    "invalid userId"
                );
            }
            if (isNaN(id / 1)) {
                throw new MakeError(
                    "유효하지 않은 commentId입니다",
                    401,
                    "invalid commentId"
                );
            } else if (!commentContent || !commentContent.trim()) {
                throw new MakeError(
                    "댓글 내용을 입력해주세요",
                    401,
                    "invalid commentContent"
                );
            }
            const updateCount = await commentRepository.updateComment(
                { commentContent, updatedAt: DataTypes.NOW },
                {
                    where: { id, userId },
                }
            );
            if (!updateCount) {
                throw new MakeError(
                    "댓글수정에 실패하였습니다",
                    412,
                    "failed to modify comment"
                );
            }
            return;
        } catch (err) {
            throw err;
        }
    };
    destroyComment = async (commentOptions) => {
        const commentRepository = new CommentRepository();
        const { id, userId } = commentOptions;
        const destroyOptions = {
            where: {
                [Op.and]: [{ id, userId }],
            },
        };

        try {
            if (isNaN(id / 1)) {
                throw new MakeError(
                    "유효하지 않은 댓글id입니다",
                    401,
                    "invalid commentId"
                );
            } else if (!userId || isNaN(userId / 1)) {
                throw new MakeError(
                    "유효하지 않은 userId입니다",
                    401,
                    "invalid userId"
                );
            }
            const destroyCount = await commentRepository.destroyComment(
                destroyOptions
            );
            if (!destroyCount) {
                throw new MakeError(
                    "댓글 삭제에 실패하였습니다",
                    412,
                    "failed to destroy comment"
                );
            }
            return;
        } catch (err) {
            throw err;
        }
    };
    findAllComment = async (
        postId,
        commentPageNum = null,
        commentPageSize = null
    ) => {
        const commentRepository = new CommentRepository();
        const num = (commentPageNum ? commentPageNum : 1) / 1;
        const size = (commentPageSize ? commentPageSize : 10) / 1;
        const options = {
            where: { postId },
            attributes: ["id", "postId", "createdAt", "commentContent"],
            order: [["createdAt", "DESC"]],
            limit: size,
            offset: (num - 1) * size,
            include: {
                model: Users,
                attributes: ["id", "nickname"],
            },
        };
        try {
            if (isNaN(num)) {
                throw new MakeError(
                    "불러올 댓글 페이지는 정수로 입력가능합니다",
                    401,
                    "pageNum err"
                );
            } else if (isNaN(size)) {
                throw new MakeError(
                    "불러올 댓글 수는 정수로 입력가능합니다",
                    401,
                    "pageSize err"
                );
            }
            const comments = await commentRepository.findAllComment(options);
            return comments;
        } catch (err) {
            throw err;
        }
    };
}
module.exports = CommentService;
