const HashTagController = require("../controllers/hashTags.controllers.js");
const hashTagController = new HashTagController();
const express = require("express");
const router = express.Router();

router.get("/hashTagSearch",hashTagController.findPostByHashTag);

module.exports = router;
