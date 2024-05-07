import { Server, Namespace, Socket } from 'socket.io';
import FriendModel from '../models/friends';
import { SocketUtils } from './utils';

export default (io: Server, middleware: (socket: Socket, err: any)=>void) => {
    const friendsNamespace: Namespace = io.of('/friends');
    friendsNamespace.use(middleware);
  
    friendsNamespace.on('connection', (socket) => {
        console.log('A client connected to the friends namespace');
        
        socket.on('cancel', async(id: string) => {
            const model = new FriendModel();
            const response = await model.reject({ id });

            socket.emit('cancel', response);
        });

        socket.on("accept", async(id: string)=>{
            const model = new FriendModel();
            const response = await model.accept({ id });

            socket.join(response?.id!);
            const friendID = socket.handshake.auth.user.id === response?.acceptorID ? response?.requesterID : response?.acceptorID;
            if(SocketUtils.getInstance().isAlive(friendID!)){
                SocketUtils.getInstance().get(friendID!)?.join(response?.id!);
            }
        
            socket.emit('accept', response);
        });
        
        socket.on("request", async(userID: string)=>{
            const model = new FriendModel();
            const response = await model.request({ user: socket.handshake.auth.user, userID });

            socket.emit("request", response)
        });
    });
};