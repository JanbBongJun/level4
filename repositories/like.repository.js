const { Likes, Users,Posts } = require("../models");

class LikeRepository {
    // 좋아요를 눌렀는지 확인한 후 눌러져 있으면, 취소 안눌려있으면 좋아요 저장
    likePost = async (userId, postId,option) => {
        return await Likes.create({ userId, postId },option);
    };
    unLikePost = async (options) => {
        return await Likes.destroy(options);
    };
    isLikePressed = async (userId,postId) => {
        return await Likes.findOne({where:{postId,userId}})
    }

    getLikedPost = async (userId) => {
        return await Users.findOne({
            where: { id:userId },
            attributes:["nickname",],
            include: {
                model: Posts,
                attributes: ["id","postTitle","postContent","viewCount","likeCount","createdAt","updatedAt"],
            },
        });
    };
}

module.exports = LikeRepository;
