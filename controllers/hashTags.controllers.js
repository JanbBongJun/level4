const HashTagService = require("../services/hashTags.service.js");

class HashTagController {
    constructor() {
        this.hashTagService = new HashTagService();
    }

    findPostByHashTag = async (req, res) => {
        const { pageSize, pageNum } = req.query;
        const { tagContent } = req.body;
        try {
            const posts = await this.hashTagService.findPostByHashTag(
                tagContent,
                pageSize,
                pageNum
            );

            return res.status(200).json(posts)
        } catch (err) {
            console.log(err)
            if(err.code===401){
                return res.status(401).json({message:err.message})
            }
            return res.status(401).json({message:"해시태그 검색에 실패하였습니다"})
        }
    };
}

module.exports = HashTagController;
