import jetLogger from "jet-logger";
import Elysia, { t } from "elysia";
import { ElysiaWS } from "elysia/ws";

import FriendModel from "../models/friends";
import { AccessKeyModel, GroupModel } from "../models";
import { Err } from "../config";

import chatSocketHandler from "./chats";
import friendsSocketHandler from "./friends";

import groupSocketHandler from "./groups";
import { MemberRoles } from "@simplechat/shared/models/member";
import ClientAuthenicationPlugin from "../plugins/client-authentication";

const connectedPlugin = new Elysia().state<"connectedSockets", Record<string, ElysiaWS>>("connectedSockets", {}).derive({ as: "global" }, async ({ store })=>({
    isOnline: (id: string) => store.connectedSockets[id] !== undefined,
    get: (id: string) => store.connectedSockets[id],
    add: (id: string, ws: ElysiaWS) =>{
        store.connectedSockets[id] = ws;
    },
    remove: (id: string) => {
        delete store.connectedSockets[id];
    },
    send: (path: string, ids: string[], message: any) =>{
        ids.forEach((id)=>{
            const socket = store.connectedSockets[id];
            if(socket){
                socket.send(path, message);
            }
        });
    }
}));

const sockets = new Elysia().decorate("accessKeyModel", new AccessKeyModel());
sockets.use(connectedPlugin).use(ClientAuthenicationPlugin).ws("/ws", {
    body: t.Object({
        operation: t.String(),
        path: t.Union([ t.Literal('chats'), t.Literal('friends'), t.Literal('groups') ]),
        chatData: t.Optional(t.Object({
            friendID: t.Optional(t.String()),
            groupID: t.Optional(t.String()),
            message: t.Optional(t.String()),
            chatID: t.Optional(t.String())
        })),
        friendsData: t.Optional(t.Object({
            friendID: t.Optional(t.String()),
            userID: t.Optional(t.String()),
        })),
        groupData: t.Optional(t.Object({
            name: t.Optional(t.String()),
            groupID: t.Optional(t.String()),
            userID: t.Optional(t.String()),
            memberID: t.Optional(t.String()),
            role: t.Optional(t.String())
        }))
    }),
    query: t.Object({ key: t.String() }),
    open: async (ws) =>{
        jetLogger.info(`user socket connected open: ${ws.data.client.details.name} ${ws.data.client.details.surname}`);
        ws.data.add(ws.data.client!.id, ws);
        try{
            const friendModel = new FriendModel();
            friendModel.all({ project: ws.data.project!, organization: ws.data.organization, client: ws.data.client! }).then((channels)=>{
                channels.forEach((channel)=> ws.subscribe(channel.id));
            });

            const groupModel = new GroupModel();
            groupModel.all({ project: ws.data.project!, organization: ws.data.organization, client: ws.data.client! }).then((groups) => {
                groups.forEach((group) => ws.subscribe(group.id));
            });
        }catch(error){
            const err = error as Err;
            jetLogger.err(err.error);
        }
    },
    close: (ws, code) =>{
        jetLogger.err(`user socket disconnected closed: ${ws.data.client.details.name} ${ws.data.client.details.surname} with code: ${code}`);
        ws.data.remove(ws.data.client!.id);
    },
    message: (ws, message: any) =>{
        console.log(`message received: ${message}`);
        switch(message.path){
            case "chats":
                if(message.chatData){
                    chatSocketHandler(ws, ws.data.client!, message.operation, message.chatData);
                }else{
                    ws.send({ path: message.path, operation: message.operation, message: "invalid chat data inputs", status: 400 });
                }
                break;
            case "friends":
                if(message.friendsData){
                    friendsSocketHandler(ws, ws.data.project!, ws.data.client!, message.operation, message.friendsData, ws.data.isOnline, ws.data.get, ws.data.organization);
                }else{
                    ws.send({ path: message.path, operation: message.operation, message: "invalid friends data inputs", status: 400 });
                }
                break;
            case "groups":
                if(message.groupData){
                    groupSocketHandler(ws, ws.data.project!, ws.data.client!, message.operation, { ...message.groupData, role: message.groupData.role as MemberRoles | undefined });
                }else{
                    ws.send({ path: message.path, operation: message.operation, message: "invalid friends data inputs", status: 400 });
                }
                break;
        }
    },
    beforeHandle: async({ client, query, accessKeyModel, status }) =>{
        if(query.key){
            const accesskey = await accessKeyModel.get(query.key);
            if(!accesskey?.enabled || accesskey.projectID !== client.projectID){
                return status(401, { message: "Access key disabled or invalid" });                
            }
        }else{
            return status(401, { message: "Access key must be provided" });
        }
    }
});

export default sockets;