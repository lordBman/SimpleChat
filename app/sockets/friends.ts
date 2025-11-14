import FriendModel from '../models/friends';
import { Err } from '../config';
import jetLogger from 'jet-logger';
import {Client, Project} from "@simplechat/shared/models";
import { ElysiaWS } from "elysia/ws";
import { SocketPaths, WSFriendOperation} from "@simplechat/shared";
import Organization from '@simplechat/shared/models/organization';

type FriendsData = { friendID?: string, userID?: string }
const path: SocketPaths = SocketPaths.Friends;

const friendsSocketHandler = (
    ws: ElysiaWS, project: Project, client: Client, operation: string, data: FriendsData,
    isOnline:(id: string)=> boolean, get: (id:string)=> ElysiaWS, organization?: Organization) =>{
    const friendModel = new FriendModel();

    switch(operation as WSFriendOperation){
        case WSFriendOperation.Request:
            if(data.userID){
                friendModel.request({ userID: data.userID!, project, organization, client }).then((friend)=>{
                    ws.subscribe(friend.id);
                    if(isOnline(data.userID!)){
                        get(data.userID!).subscribe(friend.id);
                    }
                    ws.publish(friend.id, { path, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when create friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path, operation, message: "invalid socket request", status: 400 });
            }
            break;
        case WSFriendOperation.Cancel:
            if(data.friendID){
                friendModel.cancel({ id: data.friendID!, client }).then((friend)=>{
                    ws.publish(friend.id, { path, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when canceling friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path, operation, message: "invalid socket request", status: 400 });
            }
            break;
        case WSFriendOperation.Approve:
            if(data.friendID){
                friendModel.accept({ id: data.friendID!, client }).then((friend)=>{
                    ws.publish(friend.id, { path, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when accepting friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path, operation, message: "invalid socket request", status: 400 });
            }
            break;
        case WSFriendOperation.Reject:
            if(data.friendID){
                friendModel.cancel({ id: data.friendID!, client }).then((friend)=>{
                    ws.publish(friend.id, { path, operation, friend });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path, operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path, operation, message: "an internal server error occurred when rejecting friend request", status: 503 });
                    }
                });
            }else{
                ws.send({ path, operation, message: "invalid socket request", status: 400 });
            }
            break;
    }
}

export  default friendsSocketHandler;