import { Namespace, Server, Socket } from "socket.io";
import { ChatModel } from "../models";
import { Friend, Group, Member } from "@prisma/client";
import { ConnectedSockets } from "./utils";

export const joinChatRoom = (channel: Friend | Member ) => {
    if("acceptorID" in channel){
        const friend = channel as Friend;
        if(ConnectedSockets.getInstance().isOnline(friend.requesterID)){
            const socket = ConnectedSockets.getInstance().get(friend.requesterID)!;
            if(!socket.rooms.has(friend.id)){
                socket.join(friend.id);
            }
        }
    
        if(ConnectedSockets.getInstance().isOnline(friend.acceptorID)){
            const socket = ConnectedSockets.getInstance().get(friend.acceptorID)!;
            if(!socket.rooms.has(friend.id)){
                socket.join(friend.id);
            }
        }
    }else{
        const member = channel as Member;
        if(ConnectedSockets.getInstance().isOnline(member.userID)){
            const socket = ConnectedSockets.getInstance().get(member.userID)!;
            if(!socket.rooms.has(member.groupID)){
                socket.join(member.groupID);
            }
        }   
    }
}

export default (namespace: Namespace, socket: Socket) => {
    socket.on("chat", (data: { message: string, friendID?: string, groupID?: string }, room) => {
        const chatModel = new ChatModel();

        console.log(`current room: ${room}`);

        chatModel.create({ ...data, user: socket.handshake.auth.user}).then((chat)=>{
            console.log(JSON.stringify(chat));

            namespace.to((data.friendID || data.groupID)!).emit("chat", chat, (data.friendID || data.groupID));
        });
    });

    socket.on("typing", (data: string, room)=>{
        console.log(data);
        socket.broadcast.to(room).emit("typing", {room, message:`${socket.handshake.auth.user.name} is typing...` });
    });
}