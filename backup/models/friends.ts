import { DBManager } from "../config";
import Database from "../config/database";
import { Friend, User } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";

class FriendModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async request(data: { user: User, userID: string }): Promise<Friend | undefined>{
        try{
            const id = uuid();
            const friend = await this.database.client.friend.create({ 
                data: { id, requesterID: data.user.id, acceptorID: data.userID },
                include: { acceptor: true }
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
                include: { requester: true }
            });
            return friend;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
        }
    }

    async find(data: { user: User, query: string }): Promise<{ user: User, requested: boolean, requesting: boolean, accepted: boolean }[] | undefined>{
        try{
            const users = (await this.database.client.user.findMany({ where: { NOT: { id: data.user.id } } })).filter((user)=>{
                return user.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
            });

            let results = [];
            for(let i = 0; i < users.length; i++ ){
                const init = await this.database.client.friend.findFirst({ 
                    where: {
                        OR:[ { acceptorID: data.user.id, requesterID: users[i].id }, { requesterID: data.user.id, acceptorID: users[i].id } ] } });
                if(init){
                    results.push({ user: users[i], requested: data.user.id === init.requesterID, requesting: data.user.id === init.acceptorID, accepted: init.accepted });
                }else{
                    results.push({ user: users[i], requested: false, accepted: false,  requesting: false });
                }
            }
            return results;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when searching for user");
        }
    }
}

export default FriendModel;