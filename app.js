const express = require("express");
const { Server } = require("http");
const indexRouter = require("./routes/index.js");
const cookieParser = require("cookie-parser");

const app = express();
const router = express.Router();

const http = Server(app); 

app.use(express.static("정적파일"));
app.use([express.json(),cookieParser()]);

app.use("/api", express.urlencoded({ extended: false }), router);
app.use("/",indexRouter)

module.exports = http;
