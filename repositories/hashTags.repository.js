const { HashTags, Posts_Tags,sequelize } = require("../models");
const Sequelize = require("sequelize")

class HashTagRepository {
    makeHashTags = async (HashTagsArr, options) => {
        return await HashTags.bulkCreate(HashTagsArr, options);
    };
    makePostTag = async (postTagArr, options) => {
        return await Posts_Tags.bulkCreate(postTagArr, options);
    };
    deletePostTag = async (options) => {
        return await Posts_Tags.destroy( options);
    };
    findAllHashTags = async (options) => {
        return await HashTags.findAll(options);
    };
    // findPostsByHashTag = async (findTagOptions) => {
    //     return await HashTags.findOne(findTagOptions);
    // };
    findPostsByHashTag = async (hashTag, limit, offset) => {
            const sqlQuery = 
            `
                SELECT 
                h.id, h.tagContent, h.createdAt,h.updatedAt,
                p.id AS \`Posts.id\`, p.userId AS \`Posts.userId\`,p.postTitle AS \`Posts.postTitle\`,
                p.postContent AS \`Posts.postContent\`,p.viewCount AS \`Posts.viewCount\`,p.createdAt AS \`Posts.createdAt\`,
                \`Posts->Posts_Tags\`.\`id\` AS \`Posts.Posts_Tags.id\`,
                \`Posts->Posts_Tags\`.\`postId\` AS \`Posts.Posts_Tags.postId\`,
                \`Posts->Posts_Tags\`.\`tagId\` AS \`Posts.Posts_Tags.tagId\`,
                \`Posts->User\`.\`id\` AS \`Posts.User.id\`,
                \`Posts->User\`.\`nickname\` AS \`Posts.User.nickname\`
                FROM HashTags AS h
                LEFT OUTER JOIN (Posts_Tags AS \`Posts->Posts_Tags\`
                INNER JOIN Posts AS p ON p.id = \`Posts->Posts_Tags\`.postId) ON h.id = \`Posts->Posts_Tags\`.tagId
                LEFT OUTER JOIN Users AS \`Posts->User\` ON p.userId = \`Posts->User\`.id
                WHERE h.tagContent = :hashTag
                ORDER BY p.viewCount DESC
                LIMIT :limit OFFSET :offset
            `;

            const results = await sequelize.query(sqlQuery, {
                replacements: {
                    hashTag,
                    limit,
                    offset,
                },
                type: Sequelize.QueryTypes.SELECT,
                raw: true,
                nest: true,
            });
            return results;
    };
}
module.exports = HashTagRepository;
