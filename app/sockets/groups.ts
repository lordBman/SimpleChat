import { GroupModel } from '../models';
import jetLogger from 'jet-logger';
import { Err } from '../config';
import {Client} from "@simplechat/shared/models";
import { ElysiaWS } from "elysia/ws";
import {Organization, Project, SocketPaths, WSGroupOperation} from "@simplechat/shared";
import MemberModel from "../models/members";

type GroupsData = { name?: string, groupID?: string, userID?: string, memberID?: string }

const groupSocketHandler = (ws: ElysiaWS, project: Project, client: Client, operation: string, data: GroupsData, organization?: Organization) =>{
    const model = new GroupModel();
    const memberModel = new MemberModel();

    switch (operation){
        case WSGroupOperation.Create:
            if(data.name === undefined){
                ws.send({ path: SocketPaths.Groups, operation: operation, message: "you must provided a group name", status: 400 });
                return;
            }else{
                model.create({ project, organization, client, name: data.name }).then((response)=>{
                    ws.subscribe(response.group.id);
                    ws.publish(response.group.id, { path: SocketPaths.Groups, operation, member: response });
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Groups, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Groups, operation, message: "an internal server error occurred when creating group", status: 503 });
                    }
                });
            }
            break;
        case WSGroupOperation.Cancel:
            if(data.groupID === undefined){
                ws.send({ path: SocketPaths.Groups, operation: operation, message: "you must provide a group id", status: 400 });
            }else{
                memberModel.cancel({ client, groupID: data.groupID }).then((response)=>{
                    ws.publish(response.group.id, { path: SocketPaths.Groups, operation, member: response });
                    ws.unsubscribe(response.group.id);
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Groups, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Groups, operation, message: "an internal server error occurred when canceling group request", status: 503 });
                    }
                });
            }
            break;
        case WSGroupOperation.Accept:
            if(data.groupID === undefined || data.memberID === undefined){
                ws.send({ path: SocketPaths.Groups, operation: operation, message: "you must provide both group id and member id", status: 400 });
            }else{
                memberModel.accept({ client, memberID: data.memberID, groupID: data.groupID }).then((response)=>{
                    ws.publish(response.group.id, { path: SocketPaths.Groups, operation, member: response });
                    ws.subscribe(response.group.id);
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Groups, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Groups, operation, message: "an internal server error occurred when accepting group request", status: 503 });
                    }
                });
            }
            break;
        case WSGroupOperation.Reject:
            if(data.groupID === undefined || data.memberID === undefined){
                ws.send({ path: SocketPaths.Groups, operation, message: "you must provide both group id and member id", status: 400 });
            }else{
                memberModel.reject({ client, memberID: data.memberID, groupID: data.groupID }).then((response)=>{
                    ws.publish(response.group.id, { path: SocketPaths.Groups, operation, member: response });
                    ws.unsubscribe(response.group.id);
                }).catch((error) =>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Groups, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Groups, operation, message: "an internal server error occurred when rejecting group request", status: 503 });
                    }
                });
            }
            break;
        case WSGroupOperation.Request:
            break;
        case WSGroupOperation.Assign:
            break;
        case WSGroupOperation.Delete:
            break;
        default:

    }
}

export default (namespace: Namespace, socket: Socket) => {
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