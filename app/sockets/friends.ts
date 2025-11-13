import FriendModel from '../models/friends';
import { Err } from '../config';
import jetLogger from 'jet-logger';
import {Client} from "@simplechat/shared/models";
import { ElysiaWS } from "elysia/ws";
import {Organization, Project, SocketPaths, WSFriendOperation} from "@simplechat/shared";

type FriendsData = { friendID?: string, userID?: string }

const friendsSocketHandler = (
    ws: ElysiaWS, project: Project, client: Client, operation: string, data: FriendsData,
    isOnline:(id: string)=> boolean, get: (id:string)=> ElysiaWS, organization?: Organization) =>{
    const friendModel = new FriendModel();

    switch(operation){
        case WSFriendOperation.Request:
            if(data.userID){
                friendModel.request({ userID: data.userID!, project, organization, client }).then((friend)=>{
                    ws.subscribe(friend.id);
                    if(isOnline(data.userID!)){
                        get(data.userID!).subscribe(friend.id);
                    }
                    ws.publish(friend.id, { path: SocketPaths.Friends, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Friends, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Friends, operation, message: "an internal server error occurred when create friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path: SocketPaths.Friends, operation, message: "invalid socket request", status: 400 });
            }
            break;
        case WSFriendOperation.Cancel:
            if(data.friendID){
                friendModel.cancel({ id: data.friendID!, client }).then((friend)=>{
                    ws.publish(friend.id, { path: SocketPaths.Friends, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Friends, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Friends, operation, message: "an internal server error occurred when canceling friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path: SocketPaths.Friends, operation, message: "invalid socket request", status: 400 });
            }
            break;
        case WSFriendOperation.Approve:
            if(data.friendID){
                friendModel.accept({ id: data.friendID!, client }).then((friend)=>{
                    ws.publish(friend.id, { path: SocketPaths.Friends, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Friends, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Friends, operation, message: "an internal server error occurred when accepting friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path: SocketPaths.Friends, operation, message: "invalid socket request", status: 400 });
            }
            break;
        case WSFriendOperation.Reject:
            if(data.friendID){
                friendModel.cancel({ id: data.friendID!, client }).then((friend)=>{
                    ws.publish(friend.id, { path: SocketPaths.Friends, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Friends, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Friends, operation, message: "an internal server error occurred when rejecting friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path: SocketPaths.Friends, operation, message: "invalid socket request", status: 400 });
            }
            break;
    }
}

export  default friendsSocketHandler;