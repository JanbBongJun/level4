const { Comments } = require("../models");

class CommentRepository {
    createComment = async (commentInfo, commentOptions) => {
        return await Comments.create(commentInfo, commentOptions);
    };
    updateComment = async (commentInfo, commentOptions) => {
        return await Comments.update(commentInfo, commentOptions);
    };
    destroyComment = async (commentOptions) => {
        return await Comments.destroy(commentOptions);
    };
    findAllComment = async (commentsOptions) => {
        return await Comments.findAll(commentsOptions);
    };
}

module.exports = CommentRepository;
