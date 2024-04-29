import jetLogger from "jet-logger";
import { Socket, Server } from "socket.io";
import routes from "./routes";
import jwt from "jsonwebtoken";
import FriendModel from "./models/friends";
import { ChatModel } from "./models";
import { Chat, GroupChat } from "@prisma/client";

const port = Number.parseInt(process.env.PORT || "5000");

const server = routes.listen(port, () =>{ jetLogger.info(`Express server started on port: ${port}`); });

const io = new Server(server);

io.use((socket, next)=>{
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
});


const connections = new Map<string, Socket>();

io.on("connection", (socket: Socket)=>{
    console.log(`user connected: ${socket.id}: ${JSON.stringify(socket.handshake.auth.user)}`);

    connections.set(socket.handshake.auth.user.id, socket);

    const friendModel = new FriendModel();
    
    friendModel.channels({ user: socket.handshake.auth.user }).then((channels)=>{
        if(channels){
            const init = channels.map((channel)=> channel.id);
            socket.join(init);
        }
    });

    socket.on("chat", (data: { message: string, recieverID?: string, groupID?: number }, room) => {
        const chatModel = new ChatModel();

        console.log(`current room: ${room}`);

        chatModel.create({ ...data, user: socket.handshake.auth.user}).then((chat)=>{
            console.log(JSON.stringify(chat));

            if(room){
                io.to(room).emit("chat", chat);
            }else{
                if(chat && "groupID" in chat){
                    io.to((chat as GroupChat).groupID.toString()).emit("chat", chat);
                }else if(chat && "channelID" in chat){
                    const friendSocket = connections.get(data.recieverID!);
                    if(friendSocket && !friendSocket.rooms.has((chat as Chat).channelID)){
                        friendSocket.join((chat as Chat).channelID);
                    }
    
                    if(!socket.rooms.has((chat as Chat).channelID)){
                        socket.join((chat as Chat).channelID);
                    }
                    io.to((chat as Chat).channelID).emit("chat", chat);
                }else{
    
                }
            }
        });
    });

    socket.on("typing", (data: string, room)=>{
        console.log(data);
        socket.broadcast.to(room).emit("typing", data);
    });

    socket.on("close", () => {
        connections.delete(socket.handshake.auth.user.id);
        console.log(`user left`);
    });
});