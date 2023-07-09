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
        const { postTitle, postContent, userId } = postInfo;

        if (!postTitle || !postTitle.trim()) {
            throw new MakeError(
                "게시글 제목이 존재하지 않습니다",
                401,
                "title blank err"
            );
        } else if (!postContent || !postContent.trim()) {
            throw new MakeError(
                "게시글 내용이 존재하지 않습니다",
                401,
                "title blank err"
            );
        }
        const post = await postRepository.createPost(postInfo);
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
        const { postTitle, postContent } = postInfo;
        const updatedAt = DataTypes.NOW;

        if (!postTitle || !postTitle.trim()) {
            throw new MakeError(
                "게시글 제목이 존재하지 않습니다",
                401,
                "title blank err"
            );
        } else if (!postContent || !postContent.trim()) {
            throw new MakeError(
                "게시글 내용이 존재하지 않습니다",
                401,
                "title blank err"
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
    };
    destroyPost = async (id, userId) => {
        const postRepository = new PostRepository();
        if (isNaN(id / 1)) {
            throw new MakeError("게시글 id오류", 401, "post id err");
        } else if (isNaN(userId / 1)) {
            throw new MakeError("유저 ID오류", 401, "user id err");
        } // 유효성 검사 후 destroy 수행한 후
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
    };
    findAllPosts = async (pageSize, pageNum) => {
        const postRepository = new PostRepository();
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
    };
    findOnePosts = async (id) => {
        const CustomTransactionManager = await TransactionManager(
            sequelize,
            Transaction.ISOLATION_LEVELS.READ_COMMITTED
        );
        const transaction = CustomTransactionManager.getTransaction();
        const postRepository = new PostRepository();
        if (!id || isNaN(id)) {
            throw new MakeError(
                "유효하지 않은 postId입니다",
                401,
                "invalid postId"
            );
        }
        try {
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
