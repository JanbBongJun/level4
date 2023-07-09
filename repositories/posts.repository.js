const { Posts } = require("../models");


class PostRepository {
    createPost = async (postInfo, postOptions) => {
        return await Posts.create(postInfo, postOptions);
    };
    updatePost = async (postInfo, postOptions) => {
        return await Posts.update(postInfo, postOptions);
    };
    destroyPost = async (postOptions) => {
        return await Posts.destroy(postOptions);
    };
    findAllPosts = async (postOptions) => {
        return await Posts.findAll(postOptions);
    };
    findOnePosts = async (id,postOptions) => {
        return await Posts.findByPk(id,postOptions)
    };
}

module.exports = PostRepository;
