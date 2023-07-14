const { DataTypes, Op } = require("sequelize");
const { Users, sequelize } = require("../models");
const PostRepository = require("../repositories/posts.repository.js");
const MakeError = require("../utils/error.utils.js");
const Sequelize = require("sequelize");
const HashTagService = require("../services/hashTags.service.js");
const hashTagRegex = /#[\dA-Za-zㄱ-ㅎㅏ-ㅣ가-힣]{1,18}/g;
const {
    TransactionManager,
    Transaction,
} = require("../services/transactionManager.service.js");

class PostService {
    constructor() {
        this.hashTagService = new HashTagService();
    }
    //게시글 작성
    createPost = async (postInfo) => {
        const transactionManager = await TransactionManager(
            sequelize,
            Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
        );
        const transaction = transactionManager.getTransaction();

        const postRepository = new PostRepository();
        const { userId } = postInfo;
        const postTitle = postInfo.postTitle.trim();
        const postContent = postInfo.postContent.trim();

        try{
            const post = await postRepository.createPost(
                {
                    postTitle,
                    postContent,
                    userId,
                },
                { transaction }
            );
            if (!post) {
                throw new MakeError(
                    "게시글 생성에 실패하였습니다",
                    412,
                    "failed to post"
                );
            }

            const tagArr = postContent.match(hashTagRegex);

            if (tagArr) {
                await this.hashTagService.storeTags(
                    post.id,
                    tagArr,
                    transaction
                );
            }
            await transactionManager.commitTransaction();
            return;
        }catch(err){
            await transactionManager.rollbackTransaction()
            throw err;
        }
    };
    //readCommitted
    modifyPost = async (postInfo, id, userId) => {
        const transactionManager = await TransactionManager(
            sequelize,
            Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
        );
        const transaction = transactionManager.getTransaction();

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
                    transaction,
                }
            );

            if (!updateCount) {
                throw new MakeError(
                    "게시글 수정에 실패하였습니다",
                    412,
                    "update post err"
                );
            }

            const tagArr = postContent.match(hashTagRegex);
            if (tagArr) {
                const tags = tagArr.map((tag)=>{
                    return tag.trim();
                })
                await this.hashTagService.modifyTags(id, tags, transaction);
            }
            await transactionManager.commitTransaction()
            return updateCount;
        } catch (err) {
            await transactionManager.rollbackTransaction();
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
            console.log(post);
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
                }
            );
            if (!updateCount) {
                throw MakeError(
                    "조회수 생성에 실패하였습니다",
                    401,
                    "failed add viewCount"
                );
            }
            return returnPost;
        } catch (err) {
            throw err;
        }
    };
}

module.exports = PostService;
