import jetLogger from "jet-logger";
import { Socket, Server } from "socket.io";
import routes from "./routes";
import jwt from "jsonwebtoken";
import friendsSocket from "./sockets/friends";
import chatsSocket from "./sockets/chats";

import FriendModel from "./models/friends";
import { ChatModel } from "./models";
import { ExtendedError } from "socket.io/dist/namespace";

const port = Number.parseInt(process.env.PORT || "5000");

const server = routes.listen(port, () =>{ jetLogger.info(`Express server started on port: ${port}`); });

const io = new Server(server);

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

friendsSocket(io, socketMiddleware);
chatsSocket(io, socketMiddleware);