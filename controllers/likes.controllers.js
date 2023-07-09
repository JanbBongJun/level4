const LikeService = require("../services/likes.service.js")

class LikeController {
    constructor(){
        this.likeService = new LikeService()
    }
    pressLike =async (req,res) => {
        const userId = res.locals.user.id;
        const {postId} = req.params;
        try{
            const isLike = await this.likeService.pressLike(userId/1,postId/1)
            if(isLike){
                return res.status(200).json({message:"좋아요 등록에 성공하였습니다"})
            }else{
                return res.status(201).json({message:"좋아요 취소에 성공하였습니다"})
            }
        }catch(err){
            console.log(err)
            if(err.code ===401){
                return res.status(401).json({message:err.message})
            }
            else if(err.code===412){
                return res.status(412).json({message:err.message})
            }else if(err.name ==='SequelizeForeignKeyConstraintError'){
                return res.status(401).json({message:'게시글이 존재하지 않습니다'})
            }
            return res.status(412).json({message:"알수없는 오류 발생"})
        }
    }

    getLikedPost =async (req,res) => {
        const userId = res.locals.user.id
        try{
            const posts = await this.likeService.getLikedPost(userId/1);
            return res.status(200).json({result:posts})
        }catch(err){
            console.log(err)
            if(err.code===401){
                return res.status(401).json({message:err.message});
            }
            return res.status(412).json({message:"좋아요표시한 게시글을 가져오지 못하였습니다"})
        }
    }

}

module.exports = LikeController