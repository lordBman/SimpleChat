import { Namespace, Socket } from 'socket.io';
import { joinChatRoom } from './chats';
import { ConnectedSockets } from './utils';
import { GroupModel } from '../models';

export default (namespace: Namespace, socket: Socket) => {
    socket.on('groups/create', async(input: { name: string }, room: string) => {
        const model = new GroupModel();
        const response = await model.create({ project: socket.handshake.auth.project, organization: socket.handshake.auth.organization, credential: socket.handshake.auth.credentail, ...input });

        ConnectedSockets.getInstance().send("groups/reject", [ response?.credentialID!, socket.handshake.auth.credentail.id ], response);
    });

    socket.on("groups/accept", async(input: { userID: string, groupID: string }, room: string)=>{
        const model = new GroupModel();
        const response = await model.accept({ credential: socket.handshake.auth.credentail, ...input });

        console.log(`input ${JSON.stringify(input.groupID)}: ${JSON.stringify(response)}`);

        joinChatRoom(response!);
    
        namespace.to(response?.groupID!).emit('accept', response);
    });

    socket.on("groups/reject", async(input: { userID: string, groupID: string }, room: string)=>{
        const model = new GroupModel();
        const response = await model.reject({ credential: socket.handshake.auth.credentail, ...input });

        console.log(`input ${JSON.stringify(input.groupID)}: ${JSON.stringify(response)}`);

        joinChatRoom(response!);
    
        namespace.to(response?.groupID!).emit('groups/reject', response);
    });
    
    socket.on("groups/request", async(input: { groupID: string })=>{
        const model = new GroupModel();
        const response = await model.request({ credential: socket.handshake.auth.credentail, groupID: input.groupID });

        namespace.to(response?.groupID!).emit('groups/request', response);
        ConnectedSockets.getInstance().send("groups/request", [ response?.credentialID! ], response);
    });
};