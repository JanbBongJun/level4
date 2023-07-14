const socketIo = require("socket.io");
const http = require("./app");

const io = socketIo(http);

// const isOneline = {}
io.on("connection", (socket) => {


});

