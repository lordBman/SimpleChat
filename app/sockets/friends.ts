import { Namespace, Socket } from 'socket.io';
import FriendModel from '../models/friends';
import { joinChatRoom } from './chats';
import { ConnectedSockets } from './utils';

export default (namespace: Namespace, socket: Socket) => {
    socket.on('friends/cancel', async(input: { friendID: string }, room: string) => {
        const model = new FriendModel();
        const response = await model.reject({ credential: socket.handshake.auth.credentail, id: input.friendID });

        ConnectedSockets.getInstance().send("friends/cancel", [ response?.acceptorID!, response?.requesterID! ], response);
    });

    socket.on("friends/accept", async(input: { friendID: string }, room: string)=>{
        const model = new FriendModel();
        const response = await model.accept({ credential: socket.handshake.auth.credentail, id: input.friendID });

        console.log(`input ${JSON.stringify(input.friendID)}: ${JSON.stringify(response)}`);

        joinChatRoom(response!);
    
        namespace.to(response?.id!).emit('friends/accept', response);
    });

    socket.on("friends/reject", async(input: { friendID: string }, room: string)=>{
        const model = new FriendModel();
        const response = await model.reject({ credential: socket.handshake.auth.credentail, id: input.friendID });

        console.log(`input ${JSON.stringify(input.friendID)}: ${JSON.stringify(response)}`);

        joinChatRoom(response!);
    
        namespace.to(response?.id!).emit('friends/reject', response);
    });
    
    socket.on("friends/request", async(input: { userID: string })=>{
        const model = new FriendModel();
        const response = await model.request({ project: socket.handshake.auth.project, organization: socket.handshake.auth.organization, credential: socket.handshake.auth.credentail, userID: input.userID });

        ConnectedSockets.getInstance().send("friends/request", [ response?.acceptorID!, response?.requesterID! ], response);
    });
};