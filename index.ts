import jetLogger from "jet-logger";
import { Socket, Server } from "socket.io";
import routes from "./routes";
import jwt from "jsonwebtoken";
import FriendModel from "./models/friends";
import { ChatModel } from "./models";

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
        connections.delete(socket.handshake.auth.user.id);
        console.log(`user left`);
    });
});