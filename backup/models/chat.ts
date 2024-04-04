import { HttpStatusCode } from "axios";
import { Channel, Chat, Delivered, GroupChat, Notification, User } from "@prisma/client";
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

    private async updateGroup(groupID: number): Promise<void>{
        await this.database.client.group.update({
            where: { id: groupID },
            data: { last: new Date() }
        });
    }

    async create(data: { user: User, message: string, receiverID?: string, groupID?:number }): Promise<Chat | GroupChat | undefined>{
        try{
            if(data.groupID){
                const chat = await this.database.client.groupChat.create({ 
                    data: { senderID: data.user.id, message: data.message, groupID: data.groupID },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                    }
                });
                await this.updateGroup(data.groupID);

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
                return chat;
            }

            if(data.receiverID){
                let friend = await this.database.client.friend.findFirst({
                    where: { 
                        OR: [ { requesterID: data.user.id, acceptorID: data.receiverID }, { requesterID: data.receiverID, acceptorID: data.user.id } ],
                    },
                    include: { channel: true }
                });
    
                let channel: Channel;
    
                if(friend!.channel){
                    channel = friend?.channel!;
                    await this.updateChannel(channel.id);
                }else{
                    const id = uuid();
                    channel = await this.database.client.channel.create({  data: { id, friendsID: friend!.id }, });
                }
    
                const chat = await this.database.client.chat.create({
                    data: { message: data.message, senderID: data.user.id, channelID: channel.id },
                    include: { 
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
    
                await this.database.client.notification.create({
                    data: { recieverID: data.receiverID, alert: `${data.user.name} sent you a message`, message: data.message }
                });
    
                return chat;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when processing chat");
        }
    }

    async reply(data: { user: User, message: string, chatID: number, channelID?: string, groupID?: number }): Promise<[Chat, Notification] | GroupChat | undefined>{
        try{
            if(data.channelID){
                const chat = await this.database.client.chat.create({
                    data: { message: data.message, senderID: data.user.id, channelID: data.channelID, referenceID: data.chatID },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
                await this.updateChannel(data.channelID);
    
                const notification = await this.database.client.notification.create({
                    data: { 
                        recieverID: chat.reference?.sender.id!, alert: `${data.user.name} replied to your message`, message: data.message
                    }
                });

                return [chat, notification];
            }

            if(data.groupID){
                const chat = await this.database.client.groupChat.create({ 
                    data: { senderID: data.user.id, message: data.message, groupID: data.groupID, referenceID: data.chatID },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
                await this.updateGroup(data.groupID);

                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(data.user.id !== member.userID){
                        await this.database.client.notification.create({
                            data: { 
                                groupID: data.groupID, recieverID: member.userID,
                                alert: `${data.user.name} replied to ${chat.reference?.sender.name} message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });

                return chat;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when replying to chat");
        }
    }

    async update(data: { user: User, message: string, chatID: number, channelID?: string, groupID?: number }): Promise<Chat | GroupChat | undefined>{
        try{
            if(data.channelID){
                const chat = await this.database.client.chat.update({
                    where: { id: data.chatID, senderID: data.user.id, channelID: data.channelID,  },
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
                        alert: `${data.user.name} edited a message`,
                        message: data.message
                    }
                });
                return chat;
            }

            if(data.groupID){
                const chat = await this.database.client.groupChat.update({ 
                    where: { id: data.chatID, senderID: data.user.id, groupID: data.groupID, },
                    data: { message: data.message },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });

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

                return chat;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
        }
    }

    async seen(data: { user: User, chatID: number, channelID?: string, groupID?: number }): Promise<Chat | Delivered | undefined>{
        try{
            if(data.channelID){
                const chat = await this.database.client.chat.update({
                    where: { id: data.chatID, senderID: data.user.id, channelID: data.channelID,  },
                    data: { delivered: true },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
                return chat;
            }

            if(data.groupID){
                const chat = await this.database.client.delivered.upsert({ 
                    where: { userID: data.user.id, groupID: data.groupID, chatID: data.chatID },
                    create: { userID: data.user.id, groupID: data.groupID, chatID: data.chatID },
                    update: {  },
                });
                return chat;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
        }
    }

    async delete(data: { user: User, chatID: number, channelID?: string, groupID?: number }): Promise<string| undefined>{
        try{
            if(data.channelID){
                await this.database.client.chat.delete({
                    where: { channelID: data.channelID, id: data.chatID, senderID: data.user.id, },
                });
            }

            if(data.groupID){
                await this.database.client.groupChat.delete({
                    where: { id: data.chatID,  senderID: data.user.id, groupID: data.groupID }
                });
            }

            return "chat deleting sucessful";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating deleting");
        }
    }
}

export default ChatModel;