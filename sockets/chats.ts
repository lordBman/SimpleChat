import { Namespace, Server, Socket } from "socket.io";
import FriendModel from "../models/friends";
import { ChatModel } from "../models";
import { SocketUtils } from "./utils";

export default (io: Server, middleware: (socket: Socket, err: any)=>void) => {
    const chatsNamespace: Namespace = io.of('/chats');
    chatsNamespace.use(middleware);

    chatsNamespace.on("connection", (socket: Socket)=>{
        console.log(`user connected: ${socket.id}: ${JSON.stringify(socket.handshake.auth.user)}`);
    
        SocketUtils.getInstance().add(socket.handshake.auth.user.id, socket);
    
        const friendModel = new FriendModel();
        
        friendModel.all({ user: socket.handshake.auth.user }).then((channels)=>{
            if(channels){
                const init = channels.map((channel)=> channel.id);
                socket.join(init);
            }
        });
    
        socket.on("chat", (data: { message: string, friendID?: string, groupID?: string }) => {
            const chatModel = new ChatModel();
    
            //console.log(`current room: ${room}`);
    
            chatModel.create({ ...data, user: socket.handshake.auth.user}).then((chat)=>{
                console.log(JSON.stringify(chat));
    
                io.to((data.friendID || data.groupID)!).emit("chat", chat, (data.friendID || data.groupID));
            });
        });
    
        socket.on("typing", (data: string, room)=>{
            console.log(data);
            socket.broadcast.to(room).emit("typing", data);
        });
    
        socket.on("close", () => {
            SocketUtils.getInstance().remove(socket.handshake.auth.user.id);
            console.log(`user left`);
        });
    });
}