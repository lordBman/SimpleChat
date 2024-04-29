import { DBManager } from "../config";
import Database from "../config/database";
import { Channel, Friend, User } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";

interface Result{ user: User, friend?: Friend }

class FriendModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }
    
    async all(data: { user: User }): Promise<Friend[] | undefined>{
        try{
            const friends = await this.database.client.friend.findMany({ 
                where: { OR: [ { requesterID: data.user.id }, { acceptorID: data.user.id } ] },
                include: { acceptor:{ select: { id: true, email:  true, name: true, password: false } }, requester: { select: { id:true, email:  true, name: true, password: false } } }
                
            });
            return friends;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while sending friend request");
        }
    }

    async channels(data: { user: User }): Promise<Channel[] | undefined>{
        try{
            const friends = await this.database.client.friend.findMany({ where: { OR: [ { requesterID: data.user.id }, { acceptorID: data.user.id } ], accepted: true }, include:{ channel: true } });
            
            return friends.filter((friend) => friend.channel !== null).map((friend)=> friend.channel!);
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating notification");
        }
    }

    async request(data: { user: User, userID: string }): Promise<Friend | undefined>{
        try{
            const id = uuid();
            const friend = await this.database.client.friend.create({ 
                data: { id, requesterID: data.user.id, acceptorID: data.userID },
                include: { acceptor: { select: { id: true, email:  true, name: true, password: false } } }
            });
            return friend;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while sending friend request");
        }
    }

    async accept(data: { id: string }): Promise<Friend | undefined>{
        try{
            const friend = await this.database.client.friend.update({
                where: { id: data.id },
                data: { accepted: true },
                include: { requester: { select: { id: true, email:  true, name: true, password: false } } }
            });
            return friend;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
        }
    }

    async reject(data: { id: string }): Promise<Friend | undefined>{
        try{
            const friend = await this.database.client.friend.delete({
                where: { id: data.id }
            });
            return friend;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
        }
    }

    async find(data: { user: User, query: string }): Promise<Result[] | undefined>{
        try{
            const users = (await this.database.client.user.findMany({ where: { NOT: { id: data.user.id } } })).filter((user)=>{
                return user.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
            });

            let results: Result[] = [];
            for(let i = 0; i < users.length; i++ ){
                const init = await this.database.client.friend.findFirst({ 
                    where: {
                       OR:[ { acceptorID: data.user.id, requesterID: users[i].id }, { requesterID: data.user.id, acceptorID: users[i].id } ] 
                    },
                    include: { requester: { select: { id: true, email:  true, name: true, password: false } } }
                });
                if(init){
                    results.push({ user: users[i], friend: init });
                }else{
                    results.push({ user: users[i] });
                }
            }
            return results;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when searching for user");
        }
    }
}

export default FriendModel;