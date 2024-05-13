import jetLogger from "jet-logger";
import { Namespace, Server, Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { ConnectedSockets } from "./utils";
import FriendModel from "../models/friends";
import jwt from "jsonwebtoken";
import chatsSocketPort from "./chats";
import friendsSocketPort from "./friends";

const socketMiddleware = (socket: Socket, next: (err?: ExtendedError | undefined)=>void)=>{
    try{
        if(socket.handshake.auth.token){
            const token = socket.handshake.auth.token;
    
            jetLogger.info(JSON.stringify(token));
            
            socket.handshake.auth.user = (jwt.verify(socket.handshake.auth.token, process.env.SECRET || "test" ) as any).user;
    
            next();
        }else{
            next(Error("access token not found, try sigining in agian"));
        }
    }catch(error){
        next(Error(error));
    }
}

export default (io: Server) => {
    const namespace: Namespace = io.of('/');

    namespace.use(socketMiddleware);

    ConnectedSockets.getInstance().use(namespace);

    namespace.on("connection", (socket: Socket)=>{
        console.log(`user connected: ${socket.id}: ${JSON.stringify(socket.handshake.auth.user)}`);
    
        ConnectedSockets.getInstance().add(socket.handshake.auth.user.id, socket);
    
        const friendModel = new FriendModel();
        
        friendModel.all({ user: socket.handshake.auth.user }).then((channels)=>{
            if(channels){
                const init = channels.map((channel)=> channel.id);
                socket.join(init);
                console.log(JSON.stringify(init));
            }
        });
    
        socket.on("close", () => {
            ConnectedSockets.getInstance().remove(socket.handshake.auth.user.id);
            console.log(`user left`);
        });

        chatsSocketPort(namespace, socket);
        friendsSocketPort(namespace, socket);
    });
}