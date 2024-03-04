import jwt from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import { Chat, Notification } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import { uuid } from "../utils";

class ChatModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }
    
    private async updateChannel(channelID: string): Promise<void>{
        await this.database.client.channel.update({
            where: { id: channelID },
            data: { last: new Date() }
        });
    }

    async create(data: { token: string, message: string, receiverID: string }): Promise<Chat | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.SECRET || "test" ) as any;

            let channel = await this.database.client.channel.findFirst({
                where: { 
                    OR: [ { userOneID: user.id, userTwoID: data.receiverID }, { userOneID: data.receiverID, userTwoID: user.id } ],
                },
            });

            if(!channel){
                const id = uuid();
                channel = await this.database.client.channel.create({ 
                    data: { id, userOneID: user.id, userTwoID: data.receiverID, },
                });
            }else{
                await this.updateChannel(channel.id);
            }

            const chat = await this.database.client.chat.create({
                data: { message: data.message, senderID: user.id, channelID: channel.id },
                include: { 
                    sender: true,
                    reply: { include: { sender: true } },
                    reference: { include: { sender:  true } }
                }
            });

            await this.database.client.notification.create({
                data: { recieverID: data.receiverID, alert: `${user.name} sent you a message`, message: data.message }
            });

            return chat;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when processing chat");
            }
        }
    }

    async reply(data: { token: string, message: string, chatID: number, channelID: string }): Promise<[Chat, Notification] | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.SECRET || "test" ) as any;

            const chat = await this.database.client.chat.create({
                data: { message: data.message, senderID: user.id, channelID: data.channelID, referenceID: data.chatID },
                include: {
                    sender: true,
                    reply: { include: { sender: true } },
                    reference: { include: { sender:  true } }
                }
            });
            await this.updateChannel(data.channelID);

            const notification = await this.database.client.notification.create({
                data: { 
                    recieverID: chat.reference?.sender.id!, alert: `${user.name} replied to your message`, message: data.message
                }
            });

            return [chat, notification];
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when replying to chat");
            }
        }
    }

    async update(data: {token: string, message: string, chatID: number, channelID: string }): Promise<Chat | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.SECRET || "test" ) as any;

            const chat = await this.database.client.chat.update({
                where: { id: data.chatID, senderID: user.id, channelID: data.channelID,  },
                data: { message: data.message },
                include: {
                    sender: true,
                    reply: { include: { sender: true } },
                    reference: { include: { sender:  true } }
                }
            });

            await this.database.client.notification.create({
                data: { 
                    recieverID: chat.reference?.sender.id!,
                    alert: `${user.name} edited a message`,
                    message: data.message
                }
            });
            return chat;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
            }
        }
    }

    async seen(data: { token: string, chatID: number, channelID: string }): Promise<Chat | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.SECRET || "test" ) as any;

            const chat = await this.database.client.chat.update({
                where: { id: data.chatID, senderID: user.id, channelID: data.channelID,  },
                data: { delivered: true },
                include: {
                    sender: true,
                    reply: { include: { sender: true } },
                    reference: { include: { sender:  true } }
                }
            });
            return chat;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
            }
        }
    }

    async delete(data: { token: string, chatID: number, channelID: string }): Promise<string| undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.SECRET || "test" ) as any;

            await this.database.client.chat.delete({
                where: { channelID: data.channelID, id: data.chatID, senderID: user.id, },
            });

            return "chat deleting sucessful";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating deleting");
            }
        }
    }
}

export default ChatModel;