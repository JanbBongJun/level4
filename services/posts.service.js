const { DataTypes, Op } = require("sequelize");
const { Users } = require("../models");
const PostRepository = require("../repositories/posts.repository.js");
const MakeError = require("../utils/error.utils.js");
const {
    TransactionManager,
    Transaction,
} = require("../services/transactionManager.service.js");
const Sequelize = require("sequelize");
const { sequelize } = require("../models");

class PostService {
    //게시글 작성
    createPost = async (postInfo) => {
        const postRepository = new PostRepository();
        const { userId } = postInfo;
        const postTitle = postInfo.postTitle.trim();
        const postContent = postInfo.postContent.trim();

        const post = await postRepository.createPost({
            postTitle,
            postContent,
            userId,
        });
        if (!post) {
            throw new MakeError(
                "게시글 생성에 실패하였습니다",
                412,
                "failed to post"
            );
        }
        return;
    };
    //readCommitted
    modifyPost = async (postInfo, id, userId) => {
        const postRepository = new PostRepository();
        const postTitle = postInfo.postTitle.trim();
        const postContent = postInfo.postContent.trim();
        const updatedAt = DataTypes.NOW;
        try {
            if (isNaN(id / 1)) {
                throw new MakeError(
                    "게시글번호는 숫자만 입력 가능합니다",
                    401,
                    "invalid postNum"
                );
            }
            const updateCount = await postRepository.updatePost(
                { postTitle, postContent, updatedAt },
                {
                    where: { [Op.and]: [{ id, userId }] },
                }
            );
            if (!updateCount) {
                throw new MakeError(
                    "게시글 수정에 실패하였습니다",
                    412,
                    "update post err"
                );
            }
            return updateCount;
        } catch (err) {
            throw err;
        }
    };
    destroyPost = async (id, userId) => {
        const postRepository = new PostRepository();
        try {
            if (isNaN(id / 1)) {
                throw new MakeError(
                    "게시글번호는 숫자만 입력 가능합니다",
                    401,
                    "invalid postNum"
                );
            }
            const destroyCount = await postRepository.destroyPost({
                where: { id, userId },
            });
            if (!destroyCount) {
                throw new MakeError(
                    "게시글 삭제에 실패하였습니다",
                    412,
                    "failed destroy post err"
                );
            }
        } catch (err) {
            throw err;
        }
    };
    findAllPosts = async (pageSize, pageNum) => {
        const postRepository = new PostRepository();
        try {
            if (isNaN(pageSize)) {
                throw new MakeError(
                    "유효하지 않은 pageSize입니다",
                    401,
                    "invalid pageSize"
                );
            } else if (isNaN(pageNum)) {
                throw new MakeError(
                    "유효하지 않은 pageNum입니다",
                    401,
                    "invalid pageNum"
                );
            }
            const posts = await postRepository.findAllPosts({
                attributes: [
                    "id",
                    "postTitle",
                    "postContent",
                    "viewCount",
                    "likeCount",
                    "createdAt",
                ],
                include: {
                    model: Users,
                    attributes: ["id", "nickname"],
                },
                order: [["likeCount", "DESC"]],
                limit: pageSize,
                offset: (pageNum - 1) * pageSize,
                raw: true,
                nest: true,
            });
            return posts; // 자료를 가공할지 결정
        } catch (err) {
            throw err;
        }
    };
    findOnePosts = async (id) => {
        const CustomTransactionManager = await TransactionManager(
            sequelize,
            Transaction.ISOLATION_LEVELS.READ_COMMITTED
        );
        const transaction = CustomTransactionManager.getTransaction();
        const postRepository = new PostRepository();
        try {
            if (!id || isNaN(id)) {
                throw new MakeError(
                    "유효하지 않은 postId입니다",
                    401,
                    "invalid postId"
                );
            }
            const post = await postRepository.findOnePosts(id, {
                attributes: [
                    "id",
                    "postTitle",
                    "postContent",
                    "viewCount",
                    "likeCount",
                    "createdAt",
                    "updatedAt",
                ],
                include: {
                    model: Users,
                    attributes: ["nickname"],
                },
            });
            const returnPost = {
                id: post.id,
                postTitle: post.postTitle,
                postContent: post.postContent,
                viewCount: post.viewCount + 1,
                likeCount: post.likeCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                user: {
                    nickname: post.User.nickname,
                },
            };
            const updateCount = await post.update(
                { viewCount: Sequelize.literal("viewCount+1") },
                {
                    where: { id },
                    transaction,
                }
            );
            if (!updateCount) {
                throw MakeError(
                    "조회수 생성에 실패하였습니다",
                    401,
                    "failed add viewCount"
                );
            }
            await CustomTransactionManager.commitTransaction();
            return returnPost;
        } catch (err) {
            await CustomTransactionManager.rollbackTransaction();
            throw err;
        }
    };
}

module.exports = PostService;
