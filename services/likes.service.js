const { sequelize } = require("../models");
const Sequelize = require("sequelize");
const MakeError = require("../utils/error.utils.js");
const LikeRepository = require("../repositories/like.repository.js");
const PostRepository = require("../repositories/posts.repository.js");
const {
    TransactionManager,
    Transaction,
} = require("../services/transactionManager.service.js");

//과제 제출 후 트리거 프로시저 이용해보기
class LikeService {
    constructor() {
        this.likeRepository = new LikeRepository();
        this.postRepository = new PostRepository();
    }
    // Transaction.ISOLATION_LEVELS.READ_COMMITTED
    pressLike = async (userId, postId) => {
        const transactionManager = await TransactionManager(
            sequelize
        );
        const transaction = transactionManager.getTransaction();
        try {
            if (isNaN(userId)) {
                throw new MakeError(
                    "유효하지 않은 userId 입니다",
                    401,
                    "invalid userId"
                );
            } else if (isNaN(postId)) {
                throw new MakeError(
                    "유효하지 않은 postId입니다",
                    401,
                    "invalid postId"
                );
            }
            const isPressed = await this.likeRepository.isLikePressed(
                userId,
                postId,
                { transaction }
            );

            if (isPressed) {
                const destroyLikeCount = await this.likeRepository.unLikePost({
                    where: {
                        userId,
                        postId,
                    },
                    transaction,
                });
                if (!destroyLikeCount) {
                    throw new MakeError(
                        "좋아요 취소에 실패하였습니다",
                        412,
                        "failed to dislike"
                    );
                }
                const updateCount = await this.postRepository.updatePost(
                    { likeCount: Sequelize.literal("likeCount-1") },
                    { where: { id:postId }, transaction }
                );
                if (!updateCount) {
                    throw new MakeError(
                        "좋아요 취소에 실패하였습니다",
                        412,
                        "failed to dislike"
                    );
                }
                await transactionManager.commitTransaction();
                return false;
            } else {
                await this.likeRepository.likePost(userId, postId, {
                    transaction,
                });
                const updateCount = await this.postRepository.updatePost(
                    { likeCount: Sequelize.literal("likeCount+1") },
                    { where: { id:postId }, transaction }
                );
                if (!updateCount) {
                    throw new MakeError(
                        "좋아요 등록에 실패하였습니다",
                        412,
                        "failed to postLike"
                    );
                }
                await transactionManager.commitTransaction();
                return true;
            }
        } catch (err) {
            await transactionManager.rollbackTransaction();
            throw err;
        }
    };
    getLikedPost = async (userId) => {
        try {
            if (isNaN(userId / 1)) {
                throw new MakeError(
                    "유효하지 않은 userId입니다",
                    401,
                    "invalid userId"
                );
            }
            const posts = await this.likeRepository.getLikedPost(userId);
            return posts;
        } catch (err) {
            throw err;
        }
    };
}

module.exports = LikeService;
