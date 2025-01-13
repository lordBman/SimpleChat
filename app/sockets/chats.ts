import { Namespace, Socket } from "socket.io";
import { ChatModel } from "../models";
import { Friend, Member } from "@prisma/client";
import { ConnectedSockets } from "./utils";
import jetLogger from "jet-logger";
import { Err } from "../config";

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
        if(ConnectedSockets.getInstance().isOnline(member.credentialID)){
            const socket = ConnectedSockets.getInstance().get(member.credentialID)!;
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
        chatModel.create({ ...data, credential: socket.handshake.auth.credentail}).then((chat)=>{
            console.log(JSON.stringify(chat));

            namespace.to((data.friendID || data.groupID)!).emit("chat", chat, (data.friendID || data.groupID));
        }).catch((error)=>{
            const err = error as Err;
            jetLogger.err(err.error);
            socket.emit("error", err.message);
        });
    });

    socket.on("typing", (data: { status: boolean }, room)=>{
        console.log(data);
        if(data.status){
            socket.broadcast.to(room).emit("typing", {room, message:`${socket.handshake.auth.credentail.name} is typing...` });
        }
    });
}