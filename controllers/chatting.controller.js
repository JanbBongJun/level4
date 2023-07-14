

class ChattingController{
    constructor(io){
        this.chattingRoom = io.of("/chattingRoom"); //채팅방 네임스페이스 생성
        this.isOnline = {}; //userId를 저장
        this.chattingServiceSocket = new ChattingServiceSocket ()
    }
    nameSpaceOn = () => {
        // 네임스페이스 연결
        // 클라이언트가 연결을 요청한경우 => readyToChatting을 통해 권한을 인증하고, 필요한 정보를 받아오기
        // 소켓id를 소켓의 정보를 관리? 아니면 권한인증을 진행함으로써 관리?
        
        this.chattingRoom.on("connect", (socket) => {
            this.chattingServiceSocket.readyToChatting(this.isOnline,socket);

            //서버가 메세지를 전송받았을 때
            socket.on("sendMessage", (data) => {
                this.chattingServiceSocket.handleSendMessage(socket, data);
            });

            socket.on("disconnect", () => {});
        });
    };
    
}