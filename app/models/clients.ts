import { HttpStatusCode } from "axios";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { Chat, Friend, Member, Organization, Project, Credential, Client, Group, Roles } from "@prisma/client";
import { uuid } from "../utils";
import FriendModel from "./friends";

class ClientModel{
    database: Database = DBManager.instance();

    async create(data: { id?: string, project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string, role?: Roles }): Promise<Credential>{
        try{
            const id = data.id ?? uuid();
            const credential = await this.database.client.credential.create({
                data: { adminID: data.project.ownerID, id: id, name: data.name, surname: data.surname, email: data.email, username: data.username, password: data.password, role: data.role ?? "Client" },
            });

            await this.database.client.client.create({
                data: { credentialID: credential.id, projectID: data.project.id, organizationID: data.organization?.id },
            });

            return { ...credential, password: "" };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }

    async signin(data: {  project: Project, organization?: Organization, email?: string, username?: string, password: string }): Promise<Client & { credential: Credential }>{
        try{
            const credentials = await this.database.client.credential.findMany({ where: { OR: [ { email: data.email} , { username: data.username } ] } });
            if(credentials.length > 0){
                for(var i = 0; i < credentials.length; i++){
                    const credential = credentials[i];
                    if(data.password === credential.password){
                        console.log(JSON.stringify(data.password));
                        const client = await this.database.client.client.findUniqueOrThrow({ where: { credentialID: credential.id } });
                        
                        return { ...client, credential: { ...credential, password: "" } };
                    }
                }
                throw new Err(HttpStatusCode.Unauthorized, ``, "incorrect password, check and try again");
            }
            throw new Err(HttpStatusCode.Unauthorized, ``, "account does not exists, try signing up");
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when getting user");
        }
    }

    async delete(credential: Credential): Promise<string>{
        try{
            await this.database.client.client.delete({ where: { credentialID: credential.id } });
            await this.database.client.credential.delete({ where: { id: credential.id } });
            return "user was deleted successfully";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }

    async count(data: { project: Project, organization?: Organization }): Promise<number | undefined>{
        try{
            const init = await this.database.client.client.count({
                where: { projectID: data.project.id, organizationID: data.organization?.id }
            });

            return init!;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential}): Promise<Credential & { chats: { [key: string]: Chat[] } } & { friends: Friend[] } & { members: Member[] } | undefined>{
        try{
            const friends = await new FriendModel().all({ ...data });

            let members = await this.database.client.member.findMany({
                where: { credentialID: data.credential.id },
                include: {
                    group: { include: { 
                        creator: { include: { credential: {
                            select: { id: true, name: true, surname: true, email: true, username: true }
                        }} } 
                    } }
                }
            });

            const actives = [...friends?.filter((friend)=> friend.accepted)!, ...members.filter((member)=> member.accepted ).map((member)=> member.group )];
            let chats: { [key: string]: Chat[] } = {};
            for(let i = 0; i < actives.length; i++){
                const chat = await this.database.client.chat.findMany({ 
                    where: { ownerID: actives[i].id }, 
                    orderBy: { created: "asc" }, 
                    include: { sender: {
                        include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } }
                });
                chats[actives[i].id] = chat;
            }

            return { ...data.credential, chats, friends: friends!, members };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }
}

export default ClientModel;