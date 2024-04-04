
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { Socket, Server } from "socket.io";
import routes from "./routes";



const server = routes.listen(port, () =>{ jetLogger.info(`Express server started on port: ${port}`); });

const io = new Server(server);

/*
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}*/

io.use((socket, next)=>{
    const token = socket.handshake.auth.token;

    jetLogger.info(JSON.stringify(token));

    next();
});

io.on("connection", (socket: Socket)=>{
    console.log(`user connected: ${socket.id}`);
    socket.on("chat", function(data: { message: string, handle: string }){
        console.log(JSON.stringify(data));
        io.sockets.emit("chat", data);
    });

    socket.on("typing", (data: string)=>{
        console.log(data);
        socket.broadcast.emit("typing", data);
    });

    socket.on("close", function(){
        console.log(`user left`);
    });
});