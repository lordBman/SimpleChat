import { DBManager, Err } from "../config";
import { Notification, Client, Chat } from "@simplechat/shared/models";

class ChatModel {
    async create(data: { client: Client, message: string, friendID?: string, groupID?:string }): Promise<Chat>{
        try{
            const database = DBManager.instance();
            const chat = await database.chat.create({ 
                data: { senderID: data.client.id, message: data.message, ownerID: (data.groupID || data.friendID)!, type: (data.groupID ? "Group" : "Friends") },
                include: {
                    sender: { include: { details: true } },
                }
            });

            if(data.groupID){
                const members = await database.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.client.id !== member.id){
                        await database.notification.create({
                            data: { 
                                recieverID: data.groupID, nType: "Group",
                                alert: `${data.client.details.name} drop a messge in the ${member.group.name} group`, message: data.message
                            }
                        });
                    }
                });
            }
            return { ...chat, sender: chat.sender.details };
        }catch(error){
            throw new Err(503, error, "error encountered when processing chat");
        }
    }

    async all(data: { client: Client, friendID?: string, groupID?: string }): Promise<Chat[]>{
        try{
            const database = DBManager.instance();

            const chats = await database.chat.findMany({
                where: { ownerID: (data.groupID || data.friendID)!,  },
                include: {
                    sender: { include: { details: true } },
                    reply: { include: { sender: { include: { details: true } } } },
                    reference: { include: { sender: { include: { details: true } } } }
                }
            }).then((chats)=>{
                return chats.map((chat)=>{
                    const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.details } : undefined
                    return { ...chat, sender: chat.sender.details, reference };;
                });
            });
            return chats;
        }catch(error){
            throw new Err(503, `${error}`, "error encountered when getting chats");
        }
    }

    async get(data: { client: Client, chatID: string, friendID?: string, groupID?: string }): Promise<Chat>{
        try{
            const database = DBManager.instance();

            const chat = await database.chat.update({
                where: { id: data.chatID, senderID: data.client.id, ownerID: (data.groupID || data.friendID)!  },
                data: { delivered: true },
                include: {
                    sender: { include: { details: true } },
                    reply: { include: { sender: { include: { details: true } } } },
                    reference: { include: { sender: { include: { details: true } } } }
                }
            });
            const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.details } : undefined
            return { ...chat, sender: chat.sender.details, reference };;
        }catch(error){
            throw new Err(503, `${error}`, "error encountered when getting chat");
        }
    }

    async reply(data: { client: Client, message: string, chatID: string, friendID?: string, groupID?: string }): Promise<[Chat, Notification]>{
        try{
            const database = DBManager.instance();

            const chat = await database.chat.create({
                data: { message: data.message, senderID: data.client.id, ownerID: (data.groupID || data.friendID)!, type: (data.groupID ? "Group" : "Friends"), referenceID: data.chatID },
                include: {
                    sender: { include: { details: true } },
                    reply: { include: { sender: { include: { details: true } } } },
                    reference: { include: { sender: { include: { details: true } } } }
                }
            });

            if(data.groupID){
                const members = await database.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.client.id !== member.id){
                        await database.notification.create({
                            data: { 
                                recieverID:data.groupID, nType: "Group",
                                alert: `${data.client.details.name} replied to ${chat.reference?.sender.details.name} message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
            }

            const notification = await database.notification.create({
                data: { recieverID: chat.reference?.sender.id!, nType: "User", alert: `${data.client.details.name} replied to your message`, message: data.message }
            });

            const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.details } : undefined

            const init: Chat = { ...chat, sender: chat.sender.details, reference };

            return [ init,  { ...notification, ntype: "User" } ];
        }catch(error){
            throw new Err(503, error, "error encountered when replying to chat");
        }
    }

    async update(data: { client: Client, message: string, chatID: string, friendID?: string, groupID?: string }): Promise<Chat>{
        try{
            const database = DBManager.instance();

            const chat = await database.chat.update({
                where: { id: data.chatID, senderID: data.client.id, ownerID: (data.groupID || data.friendID)! },
                data: { message: data.message, edited: true },
                include: {
                    sender: { include: { details: true } },
                    reply: { include: { sender: { include: { details: true } } } },
                    reference: { include: { sender: { include: { details: true } } } }
                }
            });
            if(data.friendID){
                await database.notification.create({
                    data: {
                        recieverID: chat.reference?.sender.id!, nType: "User",
                        alert: `${data.client.details.name} edited a message`,
                        message: data.message
                    }
                });
            }

            if(data.groupID){
                const members = await database.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.client.id !== member.id){
                        await database.notification.create({
                            data: { 
                                recieverID: data.groupID, nType: "Group",
                                alert: `${data.client.details.name} updated a message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
            }

            const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.details } : undefined
            return { ...chat, sender: chat.sender.details, reference };
        }catch(error){
            throw new Err(503, error, "error encountered when updating chat");
        }
    }

    async seen(data: { client: Client, chatID: string, friendID?: string, groupID?: string }): Promise<Chat>{
        try{
            const database = DBManager.instance();

            const chat = await database.chat.update({
                where: { id: data.chatID, senderID: data.client.id, ownerID: (data.groupID || data.friendID)!  },
                data: { delivered: true },
                include: {
                    sender: { include: { details: true } },
                    reply: { include: { sender: { include: { details: true } } } },
                    reference: { include: { sender: { include: { details: true } } } }
                }
            });
            const reference = chat.reference ? { ...chat.reference, sender: chat.reference.sender.details } : undefined
            return { ...chat, sender: chat.sender.details, reference };;
        }catch(error){
            throw new Err(503, `${error}`, "error encountered when updating chat");
        }
    }

    async delete(data: { client: Client, chatID: string }): Promise<string>{
        try{
            const database = DBManager.instance();
            
            await database.chat.delete({
                where: { id: data.chatID, senderID: data.client.id, },
            });
            return "chat deleting sucessful";
        }catch(error){
            throw new Err(503, `${error}`, "error encountered when creating deleting");
        }
    }
}

export default ChatModel;