import { HttpStatusCode } from "axios";
import { DBManager, Err } from "../config";
import { Chat, Notification, Credential } from "@simplechat/shared/models";

class ChatModel {
    async create(data: { credential: Credential, message: string, friendID?: string, groupID?:string }): Promise<Chat>{
        try{
            const database = await DBManager.instance();

            const chat = await database.chat.create({ 
                data: { senderID: data.credential.id, message: data.message, ownerID: (data.groupID || data.friendID)!, type: (data.groupID ? "Group" : "Friends") },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                }
            });

            if(data.groupID){
                const members = await database.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.credential.id !== member.credentialID){
                        await database.notification.create({
                            data: { 
                                groupID: data.groupID, recieverID: member.credentialID,
                                alert: `${data.credential.name} drop a messge in the ${member.group.name} group`, message: data.message
                            }
                        });
                    }
                });
            }
            return { ...chat, sender: chat.sender.credential };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when processing chat");
        }
    }

    async reply(data: { credential: Credential, message: string, chatID: string, friendID?: string, groupID?: string }): Promise<[Chat, Notification]>{
        try{
            const database = await DBManager.instance();

            const chat = await database.chat.create({
                data: { message: data.message, senderID: data.credential.id, ownerID: (data.groupID || data.friendID)!, type: (data.groupID ? "Group" : "Friends"), referenceID: data.chatID },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    reply: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                    reference: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } }
                }
            });

            if(data.groupID){
                const members = await database.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.credential.id !== member.credentialID){
                        await database.notification.create({
                            data: { groupID: data.groupID, recieverID: member.credentialID,
                                alert: `${data.credential.name} replied to ${chat.reference?.sender.credential.name} message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
            }

            const notification = await database.notification.create({
                data: { 
                    recieverID: chat.reference?.sender.credentialID!, alert: `${data.credential.name} replied to your message`, message: data.message
                }
            });

            const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.credential } : undefined

            const init: Chat = { ...chat, sender: chat.sender.credential, reference };

            return [ init, notification];
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when replying to chat");
        }
    }

    async update(data: { credential: Credential, message: string, chatID: string, friendID?: string, groupID?: string }): Promise<Chat>{
        try{
            const database = await DBManager.instance();

            const chat = await database.chat.update({
                where: { id: data.chatID, senderID: data.credential.id, ownerID: (data.groupID || data.friendID)! },
                data: { message: data.message },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    reply: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                    reference: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } }
                }
            });
            if(data.friendID){
                await database.notification.create({
                    data: { 
                        recieverID: chat.reference?.sender.credentialID!,
                        alert: `${data.credential.name} edited a message`,
                        message: data.message
                    }
                });
            }

            if(data.groupID){
                const members = await database.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.credential.id !== member.credentialID){
                        await database.notification.create({
                            data: { 
                                groupID: data.groupID, recieverID: member.credentialID,
                                alert: `${data.credential.name} updated a message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
            }

            const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.credential } : undefined
            return { ...chat, sender: chat.sender.credential, reference };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when updating chat");
        }
    }

    async seen(data: { credential: Credential, chatID: string, friendID?: string, groupID?: string }): Promise<Chat>{
        try{
            const database = await DBManager.instance();

            const chat = await database.chat.update({
                where: { id: data.chatID, senderID: data.credential.id, ownerID: (data.groupID || data.friendID)!  },
                data: { delivered: true },
                include: {
                    sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    reply: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                    reference: { include: { sender: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } }
                }
            });
            const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.credential } : undefined
            return { ...chat, sender: chat.sender.credential, reference };;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
        }
    }

    async delete(data: { credential: Credential, chatID: string }): Promise<string>{
        try{
            const database = await DBManager.instance();
            
            await database.chat.delete({
                where: { id: data.chatID, senderID: data.credential.id, },
            });
            return "chat deleting sucessful";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating deleting");
        }
    }
}

export default ChatModel;