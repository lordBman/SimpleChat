import { Namespace, Socket } from 'socket.io';
import { joinChatRoom } from './chats';
import { ConnectedSockets } from './utils';
import { GroupModel } from '../models';
import { MemberRole } from '@prisma/client';
import jetLogger from 'jet-logger';
import { Err } from '../config';

export default (namespace: Namespace, socket: Socket) => {
    socket.on('groups/create', (input: { name: string }, room: string) => {
        const model = new GroupModel();
        model.create({ project: socket.handshake.auth.project, organization: socket.handshake.auth.organization, credential: socket.handshake.auth.credentail, ...input }).then((response)=>{
            joinChatRoom(response!);
            namespace.to(response?.groupID!).emit('groups/create', response);
        }).catch((error) =>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("groups/error", err.message);
        });
    });

    socket.on("groups/cancel", (input: { userID: string, groupID: string }, room: string)=>{
        const model = new GroupModel();
        model.cancel({ credential: socket.handshake.auth.credentail, ...input }).then((response)=>{
            console.log(`input ${JSON.stringify(input.groupID)}: ${JSON.stringify(response)}`);

            namespace.to(response?.groupID!).emit('groups/accept', response);
        }).catch((error) =>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("groups/error", err.message);
        });
    });

    socket.on("groups/accept", (input: { userID: string, groupID: string }, room: string)=>{
        const model = new GroupModel();
        model.accept({ credential: socket.handshake.auth.credentail, ...input }).then((response)=>{
            console.log(`input ${JSON.stringify(input.groupID)}: ${JSON.stringify(response)}`);

            joinChatRoom(response!);
            namespace.to(response?.groupID!).emit('groups/accept', response);
        }).catch((error) =>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("groups/error", err.message);
        });
    });

    socket.on("groups/reject", (input: { userID: string, groupID: string }, room: string)=>{
        const model = new GroupModel();
        model.reject({ credential: socket.handshake.auth.credentail, ...input }).then((response)=>{
            console.log(`input ${JSON.stringify(input.groupID)}: ${JSON.stringify(response)}`);
    
            namespace.to(response?.groupID!).emit('groups/reject', response);
        }).catch((error) =>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("groups/error", err.message);
        });
    });
    
    socket.on("groups/request", (input: { groupID: string })=>{
        const model = new GroupModel();
        model.request({ credential: socket.handshake.auth.credentail, groupID: input.groupID }).then((response)=>{
            namespace.to(response?.groupID!).emit('groups/request', response);
            ConnectedSockets.getInstance().send("groups/request", [ response?.credentialID! ], response);
        }).catch((error) =>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("groups/error", err.message);
        });
    });

    socket.on("groups/assign", (input: { userID: string, groupID: string, role: MemberRole }, room: string)=>{
        const model = new GroupModel();
        model.assign({ credential: socket.handshake.auth.credentail, ...input }).then((response)=>{
            console.log(`input ${JSON.stringify(input.groupID)}: ${JSON.stringify(response)}`);
    
            namespace.to(response?.groupID!).emit('groups/assign', response);
        }).catch((error) =>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("groups/error", err.message);
        });
    });

    socket.on("groups/deleted", (input: { userID: string, groupID: string }, room: string)=>{
        const model = new GroupModel();
        model.delete({ credential: socket.handshake.auth.credentail, ...input }).then((response)=>{
            console.log(`input ${JSON.stringify(input.groupID)}: ${JSON.stringify(response)}`);

            namespace.to(response?.id!).emit('groups/deteted', response);
        }).catch((error) =>{
            const err = error as Err;

            jetLogger.err(err.error);
            socket.emit("groups/error", err.message);
        });
    });
};