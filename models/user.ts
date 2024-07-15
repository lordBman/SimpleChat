import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt from "jsonwebtoken";
import { Chat, Friend, Member, Organization, Project, User } from "@prisma/client";
import { uuid } from "../utils";
import FriendModel from "./friends";

class UserModel{
    database: Database = DBManager.instance();

    async create(data: { project: Project, organization?: string, name: string, email: string, password: string }): Promise<string | undefined>{
        try{
            const id = uuid();
            const init = await this.database.client.user.create({
                data: { id, projectID: data.project.id, name: data.name, email: data.email, password: data.password },
                select: { id: true, name: true, email: true } });

            const token = jwt.sign({ user: init }, process.env.SECRET || "test", { expiresIn: "7 days" } );

            return token;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async signin(data: {  project: Project, organization?: Organization, email: string, password: string }): Promise<string | undefined>{
        try{
            const init = await this.database.client.user.findFirst({ where: { projectID: data.project.id, organization: data.organization, email: data.email } });
            if(init){
                if(data.password === init.password){
                    console.log(JSON.stringify(data.password));
                    const token = jwt.sign({ user: { ...init, password: undefined }}, process.env.SECRET || "test", { expiresIn: "7 days" } );
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

    async count(data: { project: Project, organization?: Organization }): Promise<number | undefined>{
        try{
            const init = await this.database.client.user.count({
                where: { projectID: data.project.id, organization: data.organization }
            });

            return init!;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, user: User}): Promise<User & { chats: { [key: string]: Chat[] } } & { friends: Friend[] } & { members: Member[] } | undefined>{
        try{
            const friends = await new FriendModel().all({ ...data });

            const members = await this.database.client.member.findMany({
                where: { userID: data.user.id }, 
                include:{
                    group: { include: { creator: { select: { id: true, email: true, name: true } } } },
                } 
            });

            const actives = [...friends?.filter((friend)=> friend.accepted)!, ...members.filter((member)=> member.accepted ).map((member)=> member.group )];
            let chats: { [key: string]: Chat[] } = {};
            for(let i = 0; i < actives.length; i++){
                chats[actives[i].id] = await this.database.client.chat.findMany({ 
                    where: { ownerID: actives[i].id }, 
                    orderBy: { created: "asc" },
                    include: { sender: { select: { id: true, email: true, name: true } } }
                });
            }

            return { ...data.user, chats, friends: friends!, members };
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }
}

export default UserModel;