import {SocketPaths, WSChatOperation} from "@simplechat/shared";
import { ElysiaWS } from "elysia/ws";
import { ChatModel } from "../models";
import jetLogger from "jet-logger";
import { Client } from "@simplechat/shared/models";
import { Err } from "../config";

type ChatData = { friendID?: string, groupID?: string, message?: string, chatID?: string }

const chatSocketHandler = (ws: ElysiaWS, client: Client, operation: string, data: ChatData) =>{
    const chatModel = new ChatModel();

    switch(operation){
        case WSChatOperation.SendMessage:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to send message", status: 400 });
                return;
            }else{
                chatModel.create({ ...data, message: data.message!, client}).then((chat)=>{
                    ws.publish(data.friendID ?? data.groupID!, { path: SocketPaths.Chats, operation: operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: "an internal server error occurred when processing message", status: 503 });
                    }
                });
            }
            break;
        case WSChatOperation.ReplyMessage:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to reply message", status: 400 });
            }else{
                chatModel.reply({ ...data, message: data.message!, chatID: data.chatID!, client}).then((chat)=>{
                    ws.publish(data.friendID ?? data.groupID!, { path: SocketPaths.Chats, operation: operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: "an internal server error occurred when processing message", status: 503 });
                    }
                });
            }
            break;
        case WSChatOperation.EditMessage:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to edit message", status: 400 });
                return;
            }else{
                chatModel.update({ ...data, message: data.message!, chatID: data.chatID!, client}).then((chat)=>{
                    ws.publish(data.friendID ?? data.groupID!, { path: SocketPaths.Chats, operation: operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: "an internal server error occurred when processing message", status: 503 });
                    }
                });
            }
            break;
        case WSChatOperation.DeleteMessage:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to delete message", status: 400 });
                return;
            }else{
                chatModel.delete({ ...data, chatID: data.chatID!, client}).then((chat)=>{
                    ws.publish(data.friendID ?? data.groupID!, { path: SocketPaths.Chats, operation: operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: err.message, status: err.code });
                    }
                    else{
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: "an internal server error occurred when processing message", status: 503 });
                    }
                });
            }
            break;
        case WSChatOperation.Typing:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to send typing indicator", status: 400 });
            }else{
                ws.publish(data.friendID ?? data.groupID!, { path: SocketPaths.Chats, operation: operation, chatID: data.chatID, userID: client.id });
            }
            break;
        case WSChatOperation.ReadReceipt:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to send read receipt", status: 400 });
            }else{
                chatModel.seen({ ...data, chatID: data.chatID!, client}).then(()=>{
                    ws.publish(data.friendID ?? data.groupID!, { path: SocketPaths.Chats, operation: operation, chatID: data.chatID, userID: client.id });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ path: SocketPaths.Chats, operation: operation, message: "an internal server error occurred when processing read receipt", status: 503 });
                    }
                });
            }
            break;
        case WSChatOperation.Subscribe:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to subscribe", status: 400 });
                return;
            }else{
                ws.subscribe(data.friendID ?? data.groupID!);
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "subscribed successfully", status: 200 });
            }
            break;
        case WSChatOperation.Unsubscribe:
            if(data.friendID === undefined && data.groupID === undefined){
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "either friendID or groupID must be provided to unsubscribe", status: 400 });
                return;
            }else{
                ws.unsubscribe(data.friendID ?? data.groupID!);
                ws.send({ path: SocketPaths.Chats, operation: operation, message: "unsubscribed successfully", status: 200 });
            }
            break;
        default:
            ws.send({ path: SocketPaths.Chats, operation: operation, message: "invalid operation", status: 400 });
    }
}

export default chatSocketHandler;