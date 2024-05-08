import { Server, Namespace, Socket } from 'socket.io';
import FriendModel from '../models/friends';
import { SocketUtils } from './utils';

const connections = new Map<string, Socket>();

export default (io: Server, middleware: (socket: Socket, err: any)=>void) => {
    const friendsNamespace: Namespace = io.of('/friends');
    friendsNamespace.use(middleware);
  
    friendsNamespace.on('connection', (socket) => {
        connections.set(socket.handshake.auth.user.id, socket);
        console.log('A client connected to the friends namespace');
        
        socket.on('cancel', async(id: string) => {
            const model = new FriendModel();
            const response = await model.reject({ id });

            friendsNamespace.to(response?.id!).emit('cancel', response);
        });

        socket.on("accept", async(id: string)=>{
            const model = new FriendModel();
            const response = await model.accept({ id });

            if(SocketUtils.getInstance().isAlive(response?.requesterID!)){
                SocketUtils.getInstance().get(response?.requesterID!)?.join(response?.id!);
            }

            if(SocketUtils.getInstance().isAlive(response?.acceptorID!)){
                SocketUtils.getInstance().get(response?.acceptorID!)?.join(response?.id!);
            }
        
            friendsNamespace.emit('accept', response);
        });
        
        socket.on("request", async(userID: string)=>{
            const model = new FriendModel();
            const response = await model.request({ user: socket.handshake.auth.user, userID });

            if(connections.has(response?.requesterID!)){
                connections.get(response?.requesterID!)?.join(response?.id!);
            }

            if(connections.has(response?.acceptorID!)){
                connections.get(response?.acceptorID!)?.join(response?.id!);
            }

            friendsNamespace.to(response?.id!).emit("request", response)
        });

        socket.on("close", () => {
            connections.delete(socket.handshake.auth.user.id);
        });
    });
};