import { HttpStatusCode } from "axios";
import { Chat, Notification, User } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";

class ChatModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { user: User, message: string, friendID?: string, groupID?:string }): Promise<Chat | undefined>{
        try{
            const chat = await this.database.client.chat.create({ 
                data: { senderID: data.user.id, message: data.message, ownerID: (data.groupID || data.friendID)! },
                include: {
                    sender: true,
                    reply: { include: { sender: true } },
                }
            });

            if(data.groupID){
                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.user.id !== member.userID){
                        await this.database.client.notification.create({
                            data: { 
                                groupID: data.groupID, recieverID: member.userID,
                                alert: `${data.user.name} drop a messge in the ${member.group.name} group`, message: data.message
                            }
                        });
                    }
                });
            }
            return chat;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when processing chat");
        }
    }

    async reply(data: { user: User, message: string, chatID: number, friendID?: string, groupID?: string }): Promise<[Chat, Notification] | undefined>{
        try{
            const chat = await this.database.client.chat.create({
                data: { message: data.message, senderID: data.user.id, ownerID: (data.groupID || data.friendID)!, referenceID: data.chatID },
                include: {
                    sender: true,
                    reply: { include: { sender: true } },
                    reference: { include: { sender:  true } }
                }
            });

            if(data.groupID){
                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.user.id !== member.userID){
                        await this.database.client.notification.create({
                            data: {                                 groupID: data.groupID, recieverID: member.userID,
                                alert: `${data.user.name} replied to ${chat.reference?.sender.name} message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
            }

            const notification = await this.database.client.notification.create({
                data: { 
                    recieverID: chat.reference?.sender.id!, alert: `${data.user.name} replied to your message`, message: data.message
                }
            });

            return [chat, notification];
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when replying to chat");
        }
    }

    async update(data: { user: User, message: string, chatID: number, friendID?: string, groupID?: string }): Promise<Chat | undefined>{
        try{
            const chat = await this.database.client.chat.update({
                where: { id: data.chatID, senderID: data.user.id, ownerID: (data.groupID || data.friendID)! },
                data: { message: data.message },
                include: {
                    sender: true,
                    reply: { include: { sender: true } },
                    reference: { include: { sender:  true } }
                }
            });
            if(data.friendID){
                await this.database.client.notification.create({
                    data: { 
                        recieverID: chat.reference?.sender.id!,
                        alert: `${data.user.name} edited a message`,
                        message: data.message
                    }
                });
            }

            if(data.groupID){
                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.user.id !== member.userID){
                        await this.database.client.notification.create({
                            data: { 
                                groupID: data.groupID, recieverID: member.userID,
                                alert: `${data.user.name} updated a message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
            }
            return chat;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
        }
    }

    async seen(data: { user: User, chatID: number, friendID?: string, groupID?: string }): Promise<Chat | undefined>{
        try{
            const chat = await this.database.client.chat.update({
                where: { id: data.chatID, senderID: data.user.id, ownerID: (data.groupID || data.friendID)!  },
                data: { delivered: true },
                include: {
                    sender: true,
                    reply: { include: { sender: true } },
                    reference: { include: { sender:  true } }
                }
            });
            return chat;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
        }
    }

    async delete(data: { user: User, chatID: number }): Promise<string| undefined>{
        try{
            await this.database.client.chat.delete({
                where: { id: data.chatID, senderID: data.user.id, },
            });
            return "chat deleting sucessful";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating deleting");
        }
    }
}

export default ChatModel;