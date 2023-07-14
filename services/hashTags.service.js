const HashTagRepository = require("../repositories/hashTags.repository");
const MakeError = require("../utils/error.utils");
const { Op } = require("sequelize");
const hashTagRegex = /#[\dA-Za-zㄱ-ㅎㅏ-ㅣ가-힣]{1,18}/g;

class HashTagService {
    constructor() {
        this.hashTagRepository = new HashTagRepository();
    }
    storeTags = async (postId, tagArr, transaction) => {
        try {
            const tagContentArr = tagArr.map((tag) => {
                return { tagContent: tag.trim() };
            });
            await this.hashTagRepository.makeHashTags(tagContentArr, {
                ignoreDuplicates: true,
                transaction,
            });

            const allTags = await this.hashTagRepository.findAllHashTags({
                where: {
                    tagContent: { [Op.in]: tagArr },
                },
                attributes: ["id"],
                transaction,
            });
            if (!allTags.length) {
                throw new MakeError(
                    "해시태그를 찾을 수 없습니다",
                    412,
                    "can not found HashTag"
                );
            }
            const postTagIdArr = allTags.map((tag) => {
                return { postId, tagId: tag.id };
            });
            // console.log(postTagIdArr)
            await this.hashTagRepository.makePostTag(postTagIdArr, {
                transaction,
            });
            return;
        } catch (err) {
            throw err;
        }
    };

    modifyTags = async (postId, tagArr, transaction) => {
        try {
            await this.hashTagRepository.deletePostTag({
                where: { postId },
                transaction,
            }); // 해당 postId인 태그를 모두 지운다.
            await this.storeTags(postId, tagArr, transaction);
        } catch (err) {
            throw err;
        }
    };

    // 해시태그를 가져오고 include해서 post와 user가져오기
    findPostByHashTag = async (
        tagContent,
        pageSizeParameter,
        pageNumParameter
    ) => {
        const pageSize = Number(pageSizeParameter ? pageSizeParameter : 10);
        const pageNum = Number(pageNumParameter ? pageNumParameter : 1);
        hashTagRegex.lastIndex = 0;
        try {
            const isHashTagValid = hashTagRegex.test(tagContent);
            if (!isHashTagValid) {
                throw new MakeError(
                    "해시태그 형식에 일치하지 않습니다",
                    401,
                    "invalid hashTag"
                );
            } else if (isNaN(pageSize) || isNaN(pageNum)) {
                throw MakeError(
                    "입력된 페이지 형식이 올바르지 않습니다",
                    401,
                    "invalid pageSize"
                );
            }
            const posts = await this.hashTagRepository.findPostsByHashTag(
                tagContent,
                pageSize,
                (pageNum - 1) * pageSize
            );
            return posts;
        } catch (err) {
            throw err;
        }
    };
}

module.exports = HashTagService;
