import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt from "jsonwebtoken";
import { Chat, Friend, Member, Organization, Project, User, Credential, Client } from "@prisma/client";
import { uuid } from "../utils";
import FriendModel from "./friends";

class ClientModel{
    database: Database = DBManager.instance();

    async create(data: { project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string, role?: string }): Promise<Client & Credential | undefined>{
        try{
            const id = uuid();
            const credentials = await this.database.client.credential.create({
                data: { id: id, name: data.name, surname: data.surname, email: data.email, username: data.username, password: data.password, role: data.role ?? "client" },
                //select: { id: true, name: true, surname:  true, email: true, username: true, role: true }
            });

            const init = await this.database.client.client.create({
                data: { id, projectID: data.project.id, organizationID: data.organization?.id },
            });

            //const token = jwt.sign({ user:  }, process.env.SECRET || "test", { expiresIn: "7 days" } );

            return { ...credentials, ...init };
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async signin(data: {  project: Project, organization?: Organization, email?: string, username?: string, password: string }): Promise<string | undefined>{
        try{
            const credentials = await this.database.client.credential.findMany({ where: { OR: [ { email: data.email} , { username: data.username } ] } });
            if(credentials.length > 0){
                for(var i = 0; i < credentials.length; i++){
                    const credential = credentials[i];
                    if(data.password === credential.password){
                        console.log(JSON.stringify(data.password));
                        const client = await this.database.client.client.findUnique({ where: { id: credential.id } });
                        const token = jwt.sign({ user: { ...credential, ...client, password: undefined }}, process.env.SECRET || "test", { expiresIn: "7 days" } );
                        return token;
                    }
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
                where: { projectID: data.project.id, organizationID: data.organization?.id }
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