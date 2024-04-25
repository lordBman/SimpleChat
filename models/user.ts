import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt from "jsonwebtoken";
import { Channel, Friend, Group, Member, User } from "@prisma/client";
import { uuid } from "../utils";

class UserModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { name: string, email: string, password: string }): Promise<string | undefined>{
        try{
            const id = uuid();
            const init = await this.database.client.user.create({ data: { id, ...data } });

            const token = jwt.sign({ user: init }, process.env.SECRET || "test", { expiresIn: "10 seconds" } );

            return token;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async signin(data: { email: string, password: string }): Promise<string | undefined>{
        try{
            const init = await this.database.client.user.findFirst({ where: { email: data.email } });
            if(init){
                if(data.password === init.password){
                    console.log(JSON.stringify(data.password));
                    const token = jwt.sign({ user: init }, process.env.SECRET || "test", { expiresIn: "7 days" } );
                    return token;
                }
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "incorrect password, check and try again");
            }
            this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "account does not exists, try signing up");
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting user");
        }
    }

    async delete(user: User): Promise<string | undefined>{
        try{
            await this.database.client.user.delete({ where: { id: user.id } });

            return "user was deleted successfully";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(user: User): Promise<User & { chats: Array<Channel | Group> } & { friends: Friend[] } & { members: Member[] } | undefined>{
        try{
            const init = await this.database.client.user.findUnique({
                where:{ id: user.id },
                include: { notifications: { orderBy: { created: "desc" } } }
            });

            const friends = (await this.database.client.friend.findMany({
                where: { OR: [{ requesterID: user.id }, { acceptorID: user.id }, ] }, 
                include:{
                    requester: { select: { id: true, email:  true, name: true } }, 
                    acceptor: { select: { id: true, email:  true, name: true } },
                    channel: true
                }
            }));

            const channels: Channel[] = friends.filter((predicate)=>{ return predicate.accepted && predicate.channel  }).map((value)=>{
                return value.channel!
            });

            const members = await this.database.client.member.findMany({ where: { userID: user.id }, include:{ group: true } });

            const groups: Group[] = [];
            for(let i = 0; i < members.length; i++){
                const member = members[i];
                if(member.accepted){
                    const group = await this.database.client.group.findUnique({
                        where: { id: member.groupID },
                        include: { members: { include: { user: true } }, chats: { where:{ createdAt: { gte: member.joined } }, orderBy: { createdAt:  "desc" }, include: { sender: true } } } }
                    );
                    groups.push(group!);
                }
            }

            const chats = [ ...channels, ...groups ].sort((a, b)=> b.last.valueOf() - a.last.valueOf());

            return { ...init!, chats, friends, members };
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }
}

export default UserModel;