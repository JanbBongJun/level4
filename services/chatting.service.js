const ChattingRepository = require("../repositories/chatting.repository.js");
const { authMiddlewareSocket } = require("../middleware/auth.middleware.js");
const {
    TransactionManager,
    Transaction,
} = require("../services/transactionManager.service.js");
const MakeError = require("../utils/error.utils.js");
const { sequelize } = require("../models");

// 메신저기능 로직
// 웹사이트에 접속하면
// 1. 유저를 online에 올린다.

// 2. 유저가 속한 chattingRoom 정보를 가져온다.
//    2-1. 유저가 속한 채팅방 메세지를 초기에 30개 가져온후 emit하여 정보를 전달한다

// 3-1. isOnline테이블에는 userId를 키값으로하며, roomId에대한 정보배열을 value로 지정한다
//  3-1-1. userId에 속한 room정보를 가져온다
//  3-1-2 roomId에 해당하는 room에 join한다. ex socket.join(roomId)

// 3-2. chattingRoom테이블에는 roomId를 키값으로 가지며, userId에대한 정보배열을 value로 지정한다.

// 4. 만약 클라이언트가 메세지를 emit했다면, 해당 data를 통해서 roomId를 통해서 emit한다.
// socket.to(room).emit("asdf",{userId:"메세지내용"});

// 5. disconnecting될때
// delete isOnline[key]로 삭제한다.
class ChattingServiceSocket {
    constructor(io) {
        this.chattingRoom = io.of("/chattingRoom"); //채팅방 네임스페이스 생성
        this.chattingRepository = new ChattingRepository();
        this.chattingServiceHTTP = new ChattingServiceHTTP();
    }


    //권한을 인증하는 로직과 함께 인증이 통과하면 해당 user에 대한 정보 받아오기
    readyToChatting = async (isOnline,socket) => {
        try {
            const user = authMiddlewareSocket(["id", "nickname"], socket);
            const userId = user.id;

            if (user) {
                const RoomsAndMessages =
                    await this.chattingRepository.getRoomsAndUsers(userId);
                const rommIdArr = RoomsAndMessages.map((chattingRoom) => {
                    //
                    socket.join(chattingRoom.id);
                    rooms[chattingRoom.id] =
                        rooms[chattingRoom.id].push(userId);
                    return chattingRoom.id;
                });
                isOnline[userId] = rommIdArr;
                //클라이언트 채팅방 초기설정
                socket.emit("RoomUserInfo", RoomsAndMessages);
            } else {
                //로그인되지않은 유저는 소켓 접속종료 => 클라이언트에서 로그인 후 재접속?
                socket.disconnect();
            }
        } catch (err) {
            
        }
    };

    // 채팅방을 만드는건 소켓io가 아닌 express의 router 이용
    // 채팅방과 중간테이블에 데이터를 추가하는 일련의 과정을 하나의 작업단위로 처리


    handleSendMessage = (socket, data) => {
        const { roomId, userId, message } = data;
        const sendMessage = { userId, message };
        this.chattingServiceHTTP.storeMessage(data);
        socket.broadcast.to(roomId).emit("sendMessage", sendMessage);
    };

    handleDisconnect = (socket) => {};

    //유저가 채팅방에 가입하는 로직

    joinChattingRoom = async (userId) => {};

    getChattingMessage = async (roomId) => {
        await this.chattingRepository.getChattingMessage(roomId);
    };
}

class ChattingServiceHTTP{
    constructor(){
        this.chattingRepository = new ChattingRepository();
    }

    //express post요청으로 처리
    makeChattingRoom = async (roomInfoObject, userInfoArr) => {
        const transactionManager = await TransactionManager(
            sequelize,
            Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
        );
        const transaction = transactionManager.getTransaction();

        try {
            //1. 채팅방 생성
            const { name, password } = roomInfoObject;
            const chattingRoom = await this.chattingRepository.makeChattingRoom(
                { name, password },
                {
                    transaction,
                }
            );

            // 2. 중간테이블에 User들과 채팅방 추가 by bulkCreate
            const roomId = chattingRoom.id;
            const roomUserInfoArr = userInfoArr.map((userId) => {
                return { roomId, userId };
            });
            await this.chattingRepository.addUserToRoom(roomUserInfoArr, {
                transaction,
            });

            await transactionManager.commitTransaction();
        } catch (err) {
            await transactionManager.rollbackTransaction();
            throw err;
        }
    };

     // Q:해당 채팅방에 속한 유저인지 검사해야하는지?
    // storeMessage와 sendMessage를 구현해서 controller에서 합치기
    // 만약 메세지 전송에 실패한경우 데이터를 실패한 메세지를 저장하도록 하는 테이블 만들어서
    // 별도로 관리하기?
    // 만약 저장에 실패한경우 메세지를 보내지 않는다
    //express post요청
    storeMessage = async (data) => {
        try {
            const { roomId, userId, message } = data;
            const result = await this.chattingRepository.storeMessage({
                roomId,
                userId,
                message,
            });
            if (!result) {
                throw new MakeError(
                    "메세지 저장에 실패하였습니다",
                    401,
                    "failed to store message"
                );
            }
            return true;
        } catch (err) {
            throw err;
        }
    };
}

module.exports = ChattingServiceSocket;
