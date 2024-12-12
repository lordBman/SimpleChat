import { HttpStatusCode } from "axios";
import { Chat, Notification, Credential } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";

class ChatModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { credential: Credential, message: string, friendID?: string, groupID?:string }): Promise<Chat | undefined>{
        try{
            const chat = await this.database.client.chat.create({ 
                data: { senderID: data.credential.id, message: data.message, ownerID: (data.groupID || data.friendID)! },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } }
                }
            });

            if(data.groupID){
                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.credential.id !== member.credentialID){
                        await this.database.client.notification.create({
                            data: { 
                                groupID: data.groupID, recieverID: member.credentialID,
                                alert: `${data.credential.name} drop a messge in the ${member.group.name} group`, message: data.message
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

    async reply(data: { credential: Credential, message: string, chatID: number, friendID?: string, groupID?: string }): Promise<[Chat, Notification] | undefined>{
        try{
            const chat = await this.database.client.chat.create({
                data: { message: data.message, senderID: data.credential.id, ownerID: (data.groupID || data.friendID)!, referenceID: data.chatID },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    reply: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                    reference: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } }
                }
            });

            if(data.groupID){
                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.credential.id !== member.credentialID){
                        await this.database.client.notification.create({
                            data: { groupID: data.groupID, recieverID: member.credentialID,
                                alert: `${data.credential.name} replied to ${chat.reference?.sender.credential.name} message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
            }

            const notification = await this.database.client.notification.create({
                data: { 
                    recieverID: chat.reference?.sender.credentialID!, alert: `${data.credential.name} replied to your message`, message: data.message
                }
            });

            return [chat, notification];
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when replying to chat");
        }
    }

    async update(data: { credential: Credential, message: string, chatID: number, friendID?: string, groupID?: string }): Promise<Chat | undefined>{
        try{
            const chat = await this.database.client.chat.update({
                where: { id: data.chatID, senderID: data.credential.id, ownerID: (data.groupID || data.friendID)! },
                data: { message: data.message },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    reply: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                    reference: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } }
                }
            });
            if(data.friendID){
                await this.database.client.notification.create({
                    data: { 
                        recieverID: chat.reference?.sender.credentialID!,
                        alert: `${data.credential.name} edited a message`,
                        message: data.message
                    }
                });
            }

            if(data.groupID){
                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.credential.id !== member.credentialID){
                        await this.database.client.notification.create({
                            data: { 
                                groupID: data.groupID, recieverID: member.credentialID,
                                alert: `${data.credential.name} updated a message in the ${member.group.name} group`,
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

    async seen(data: { credential: Credential, chatID: number, friendID?: string, groupID?: string }): Promise<Chat | undefined>{
        try{
            const chat = await this.database.client.chat.update({
                where: { id: data.chatID, senderID: data.credential.id, ownerID: (data.groupID || data.friendID)!  },
                data: { delivered: true },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    reply: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                    reference: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } }
                }
            });
            return chat;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
        }
    }

    async delete(data: { credential: Credential, chatID: number }): Promise<string| undefined>{
        try{
            await this.database.client.chat.delete({
                where: { id: data.chatID, senderID: data.credential.id, },
            });
            return "chat deleting sucessful";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating deleting");
        }
    }
}

export default ChatModel;