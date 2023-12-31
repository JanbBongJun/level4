const { ValidationError } = require("sequelize");
const authMiddleware = require("../middleware/auth.middleware.js");
const PostService = require("../services/posts.service.js");
const MakeError = require("../utils/error.utils.js");

// 게시글생성
class PostController {
    createPost = async (req, res) => {
        const { postTitle, postContent } = req.body;
        const userId = res.locals.user.id;

        try {
            const postService = new PostService();
            await postService.createPost({ postTitle, postContent, userId });
            return res
                .status(200)
                .json({ message: "게시글을 성공적으로 생성하였습니다" });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else if (err instanceof ValidationError) {
                return res.status(401).json({ message: err.message });
            } else if (err.code === 412) {
                return res.status(412).json({ message: err.message });
            }
            return res
                .status(412)
                .json({ message: "게시글 생성에 실패하였습니다." });
        }
    };

    modifyPost = async (req, res) => {
        const { id } = req.params;
        const userId = res.locals.user.id;
        const postTitle = req.body.postTitle.trim();
        const postContent = req.body.postContent.trim();
        try {
            const postService = new PostService();
        
            await postService.modifyPost(
                { postTitle, postContent },
                id/1,
                userId
            );
            return res
                .status(200)
                .json({ message: "게시글을 성공적으로 수정하였습니다" });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else if (err instanceof ValidationError) {
                return res.status(401).json({ message: err.message });
            } else if(err.original.errno ===1452){
                return res.status(401).json({message:"존재하지 않는 게시글입니다"})
            }
            else {
                return res
                    .status(412)
                    .json({ message: "게시글 수정에 실패하였습니다" });
            }
        }
    };

    dsetroyPost = async (req, res) => {
        const { id } = req.params;
        const userId = res.locals.user.id;
        try {
            const postService = new PostService();
            await postService.destroyPost(id, userId);
            return res
                .status(200)
                .json({ message: "게시글 삭제에 성공하였습니다" });
        } catch (err) {
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else {
                return res
                    .status(412)
                    .json({ message: "게시글 삭제에 실패하였습니다" });
            }
        }
    };

    findAllPosts = async (req, res) => {
        const pageSize = Number(req.query.pageSize ? req.query.pageSize : 10);
        const pageNum = Number(req.query.pageNum ? req.query.pageNum : 1);

        try {
            const postService = new PostService();
            const posts = await postService.findAllPosts(pageSize, pageNum);
            return res.status(200).json({
                pageSize,
                pageNum,
                contentNum: posts.length,
                result: posts,
            });
        } catch (err) {
            console.log(err);
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else {
                return res
                    .status(412)
                    .json({ message: "게시글 조회에 실패하였습니다" });
            }
        }
    };

    findOnePosts = async (req, res) => {
        const { id } = req.params;

        try {
            const postService = new PostService();
            const post = await postService.findOnePosts(id);
            return res.status(200).json({ result: post });
        } catch (err) {
            console.log(err);
            if (err.code === 401) {
                return res.status(401).json({ message: err.message });
            } else {
                return res
                    .status(412)
                    .json({ message: "게시글 조회에 실패하였습니다" });
            }
        }
    };
}

module.exports = PostController;
