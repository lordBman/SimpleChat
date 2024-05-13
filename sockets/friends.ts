import { Namespace, Socket } from 'socket.io';
import FriendModel from '../models/friends';
import { joinChatRoom } from './chats';
import { ConnectedSockets } from './utils';

export default (namespace: Namespace, socket: Socket) => {
    socket.on('cancel', async(input: { friendID: string }, room: string) => {
        const model = new FriendModel();
        const response = await model.reject({ id: input.friendID });

        ConnectedSockets.getInstance().send("cancel", [ response?.acceptorID!, response?.requesterID! ], response);
    });

    socket.on("accept", async(input: { friendID: string }, room: string)=>{
        const model = new FriendModel();
        const response = await model.accept({ id: input.friendID });

        console.log(`input ${JSON.stringify(input.friendID)}: ${JSON.stringify(response)}`);

        joinChatRoom(response!);
    
        namespace.to(response?.id!).emit('accept', response);
    });
    
    socket.on("request", async(input: { userID: string })=>{
        const model = new FriendModel();
        const response = await model.request({ user: socket.handshake.auth.user, userID: input.userID });

        ConnectedSockets.getInstance().send("cancel", [ response?.acceptorID!, response?.requesterID! ], response);
    });
};