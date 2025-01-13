import { Namespace, Socket } from 'socket.io';
import FriendModel from '../models/friends';
import { joinChatRoom } from './chats';
import { ConnectedSockets } from './utils';
import { Err } from '../config';
import jetLogger from 'jet-logger';

export default (namespace: Namespace, socket: Socket) => {
    socket.on('friends/cancel', async(input: { friendID: string }, room: string) => {
        const model = new FriendModel();
        model.reject({ credential: socket.handshake.auth.credentail, id: input.friendID }).then((response)=>{
            ConnectedSockets.getInstance().send("friends/cancel", [ response?.acceptorID!, response?.requesterID! ], response);
        }).catch((error)=>{
            const err = error as Err;
            jetLogger.err(err.error);
            socket.emit("friends/error", err.message);
        });
    });

    socket.on("friends/accept", (input: { friendID: string }, room: string)=>{
        const model = new FriendModel();
        
        model.accept({ credential: socket.handshake.auth.credentail, id: input.friendID }).then((response)=>{
            console.log(`input ${JSON.stringify(input.friendID)}: ${JSON.stringify(response)}`);

            joinChatRoom(response!);
            namespace.to(response?.id!).emit('friends/accept', response);
        }).catch((error)=>{
            const err = error as Err;
            jetLogger.err(err.error);
            socket.emit("friends/error", err.message);
        });
    });

    socket.on("friends/reject", (input: { friendID: string }, room: string)=>{
        const model = new FriendModel();
        model.reject({ credential: socket.handshake.auth.credentail, id: input.friendID }).then((response)=>{
            console.log(`input ${JSON.stringify(input.friendID)}: ${JSON.stringify(response)}`);

            joinChatRoom(response!);
            namespace.to(response?.id!).emit('friends/reject', response);
        }).catch((error)=>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("friends/error", err.message);
        });
    });
    
    socket.on("friends/request", (input: { userID: string })=>{
        const model = new FriendModel();
        model.request({ project: socket.handshake.auth.project, organization: socket.handshake.auth.organization, credential: socket.handshake.auth.credentail, userID: input.userID }).then((response)=>{
            ConnectedSockets.getInstance().send("friends/request", [ response?.acceptorID!, response?.requesterID! ], response);
        }).catch((error)=>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("friends/error", err.message);
        });
    });
};