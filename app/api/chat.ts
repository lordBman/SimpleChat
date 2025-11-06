import { ChatModel, GroupModel } from "../models";
import { Err } from "../config";
import jetLogger from "jet-logger";
import Elysia, { t } from "elysia";
import { ClientAuthenicationPlugin, connectedPlugin, keyAuthenicationPlugin } from "./plugins";
import FriendModel from "../models/friends";
import { WSChatOperation } from "@simplechat/shared";

const chatRouter = new Elysia({ prefix: "/chat" }).decorate({ "chatModel": new ChatModel() });

chatRouter.use(keyAuthenicationPlugin).use(ClientAuthenicationPlugin).use(connectedPlugin)
.get("/:ownerID/:id?", async({ params, body, chatModel, client, status }) =>{
    if(params.ownerID || body.groupID || body.friendID){
        try{
            if(body.id ?? params.id){
                const response = await chatModel.get({ client: client!, chatID: body.id ?? params.id!, friendID: params.ownerID || body.friendID!, groupID: params.ownerID || body.groupID! });
                return status(200, response);
            }else{
                const response = await chatModel.all({ client: client!, friendID: params.ownerID || body.friendID, groupID: params.ownerID || body.groupID }); 
                return status(200, response);
            }
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred when getting chats" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { params: t.Object({ id: t.Optional(t.String()), ownerID: t.Optional(t.String()) }), body: t.Object({ id: t.Optional(t.String()), groupID: t.Optional(t.String()), friendID: t.Optional(t.String()) }) })

.post("/", async({ chatModel, client, body, status, store }) =>{
    if(body.friendID || body.groupID ){
        try{
            const init = await chatModel.create({ ...body, client: client! });

            store.connectedSockets[client!.id]?.publish(init.ownerID, { operation: WSChatOperation.SendMessage, chat: init });
            return status(201, init);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred when processing message" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { body: t.Object({ message: t.String(), friendID: t.Optional(t.String()), groupID: t.Optional(t.String()) }) })

.patch("/", async({ body, chatModel, client, status, store }) =>{
    if(body.friendID || body.groupID){
        try{
            const init = await chatModel.update({ ...body, client: client! });
            store.connectedSockets[client!.id]?.publish(init.ownerID, { operation: WSChatOperation.EditMessage, chat: init });
            return status(201, init);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred when updating message" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { body: t.Object({ chatID: t.String(), message: t.String(), friendID: t.Optional(t.String()), groupID: t.Optional(t.String()) }) })

.ws("/ws", {
    body: t.Object({
        operation: t.String(),
        friendID: t.Optional(t.String()),
        groupID: t.Optional(t.String()),
        message: t.Optional(t.String()),
        chatID: t.Optional(t.String()),
    }),
    open: async (ws) =>{
        console.log("socket connected on chat route");
        ws.data.add(ws.data.client!.id, ws);
        try{
            const friendModel = new FriendModel();
            friendModel.all({ project: ws.data.project!, organization: ws.data.organization, client: ws.data.client! }).then((channels)=>{
                channels.forEach((channel)=> ws.subscribe(channel.id) );
            });

            const groupModel = new GroupModel();
            groupModel.all({ project: ws.data.project!, organization: ws.data.organization, client: ws.data.client! }).then((groups) => {
                groups.forEach((group) => ws.subscribe(group.id) );
            });
        }catch(error){
            const err = error as Err;
            jetLogger.err(err.error);
        }
    },
    close: (ws) =>{
        console.log("socket disconnected on friends route");
        ws.data.remove(ws.data.client!.id);
    },
    message: (ws, message) =>{
        console.log(`message received: ${message}`);
        if(message.operation === WSChatOperation.SendMessage){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to send message", status: 400 });
                return;
            }else{
                ws.data.chatModel.create({ ...message, message: message.message!, client: ws.data.client!}).then((chat)=>{
                    ws.publish(message.friendID ?? message.groupID!, { operation: message.operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ operation: message.operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ operation: message.operation, message: "an internal server error occurred when processing message", status: 503 });
                    }                
                });
            }
        }else if(message.operation === WSChatOperation.ReplyMessage){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to reply message", status: 400 });
                return;
            }else{
                ws.data.chatModel.reply({ ...message, message: message.message!, chatID: message.chatID!, client: ws.data.client!}).then((chat)=>{
                    ws.publish(message.friendID ?? message.groupID!, { operation: message.operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ operation: message.operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ operation: message.operation, message: "an internal server error occurred when processing message", status: 503 });
                    }  
                });
            }
        }else if(message.operation === WSChatOperation.EditMessage){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to edit message", status: 400 });
                return;
            }else{
                ws.data.chatModel.update({ ...message, message: message.message!, chatID: message.chatID!, client: ws.data.client!}).then((chat)=>{
                    ws.publish(message.friendID ?? message.groupID!, { operation: message.operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ operation: message.operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ operation: message.operation, message: "an internal server error occurred when processing message", status: 503 });
                    }
                });
            }
        }else if(message.operation === WSChatOperation.DeleteMessage){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to delete message", status: 400 });
                return;
            }else{
                ws.data.chatModel.delete({ ...message, chatID: message.chatID!, client: ws.data.client!}).then((chat)=>{
                    ws.publish(message.friendID ?? message.groupID!, { operation: message.operation, chat });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ operation: message.operation, message: err.message, status: err.code });
                    }
                    else{
                        ws.send({ operation: message.operation, message: "an internal server error occurred when processing message", status: 503 });
                    }
                });
            }
        }else if(message.operation === WSChatOperation.Typing){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to send typing indicator", status: 400 });
                return;
            }else{
                ws.publish(message.friendID ?? message.groupID!, { operation: message.operation, chatID: message.chatID, userID: ws.data.client!.id });
            }
        }else if(message.operation === WSChatOperation.ReadReceipt){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to send read receipt", status: 400 });
                return;
            }else{
                ws.data.chatModel.seen({ ...message, chatID: message.chatID!, client: ws.data.client!}).then(()=>{
                    ws.publish(message.friendID ?? message.groupID!, { operation: message.operation, chatID: message.chatID, userID: ws.data.client!.id });
                }).catch((error)=>{
                    jetLogger.err(error);
                    if(error instanceof Err){
                        const err = error as Err;
                        ws.send({ operation: message.operation, message: err.message, status: err.code });
                    }else{
                        ws.send({ operation: message.operation, message: "an internal server error occurred when processing read receipt", status: 503 });
                    }
                });
            }
        }else if(message.operation === WSChatOperation.Subscribe){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to subscribe", status: 400 });
                return;
            }else{
                ws.subscribe(message.friendID ?? message.groupID!);
                ws.send({ operation: message.operation, message: "subscribed successfully", status: 200 });
            }
        }else if(message.operation === WSChatOperation.Unsubscribe){
            if(message.friendID === undefined && message.groupID === undefined){
                ws.send({ operation: message.operation, message: "either friendID or groupID must be provided to unsubscribe", status: 400 });
                return;
            }else{
                ws.unsubscribe(message.friendID ?? message.groupID!);
                ws.send({ operation: message.operation, message: "unsubscribed successfully", status: 200 });
            }
        }else{
            ws.send({ operation: message.operation, message: "invalid operation", status: 400 });
        }
    }
});

export default chatRouter;