import { HttpStatusCode } from "axios";
import { DBManager, Err } from "../config";
import { uuid } from "../utils";
import FriendModel from "./friends";
import { Project, Organization, Credential, SimpleChatState } from "@simplechat/shared";
import { Roles,  Client, Chat } from "@simplechat/shared/models";
import GroupModel from "./groups";

class ClientModel{
    async create(data: { id?: string, project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string, role?: Roles }): Promise<Client & { credential: Partial<Credential> }>{
        try{
            const database = await DBManager.instance();

            const id = data.id ?? uuid();
            const credential = await database.credential.create({
                data: { adminID: data.project.owner.id, id: id, name: data.name, surname: data.surname, email: data.email, username: data.username, password: data.password, role: data.role ?? "Client" },
                select: { id: true, name: true, surname: true, email: true, username: true, adminID: true, role: true }
            });

            const client = await database.client.create({
                data: { credentialID: credential.id, projectID: data.project.id, organizationID: data.organization?.id },
            });

            return { ...client, credential };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }

    async connect(data: { project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string }): Promise<Client & { credential: Credential }>{
        try{
            const database = await DBManager.instance();

            let credential = await database.credential.findFirst({ 
                where: {  adminID: data.project.owner.id, name: data.name, surname: data.surname, email: data.email, username: data.username },
                select: { id: true, name: true, surname: true, email: true, username: true, adminID: true, role: true }
            });
            if(credential === null){
                credential = await database.credential.create({
                    data: { adminID: data.project.owner.id, name: data.name, surname: data.surname, email: data.email, username: data.username, password: uuid(), role: "Client" },
                    select: { id: true, name: true, surname: true, email: true, username: true, adminID: true, role: true }
                });
            }

            const client = await database.client.upsert({
                where: { credentialID: credential.id, projectID: data.project.id, organizationID: data.organization?.id }, update: {},
                create: { credentialID: credential.id, projectID: data.project.id, organizationID: data.organization?.id }
            });

            return { ...client, credential };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when connecting user");
        }
    }

    async signin(data: {  project: Project, organization?: Organization, email?: string, username?: string, password: string }): Promise<Client & { credential: Credential }>{
        try{
            const database = await DBManager.instance();

            const credentials = await database.credential.findMany({ where: { OR: [ { email: data.email} , { username: data.username } ] } });
            if(credentials.length > 0){
                for(var i = 0; i < credentials.length; i++){
                    const credential = credentials[i];
                    if(data.password === credential.password){
                        console.log(JSON.stringify(data.password));
                        const client = await database.client.findUniqueOrThrow({ where: { credentialID: credential.id } });
                        
                        return { ...client, credential: credential };
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
            const database = await DBManager.instance();

            await database.client.delete({ where: { credentialID: credential.id } });
            await database.credential.delete({ where: { id: credential.id } });
            return "user was deleted successfully";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }

    async count(data: { project: Project, organization?: Organization }): Promise<number | undefined>{
        try{
            const database = await DBManager.instance();
            
            const init = await database.client.count({
                where: { projectID: data.project.id, organizationID: data.organization?.id }
            });

            return init!;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential}): Promise<Omit<SimpleChatState, "token">>{
        try{
            const database = await DBManager.instance();

            const friends = await new FriendModel().all({ ...data });
            const members = await new GroupModel().all({ ...data });

            const actives = [...friends?.filter((friend)=> friend.accepted)!, ...members.filter((member)=> member.accepted ).map((member)=> member.group )];

            let chats: { [key: string]: Chat[] } = {};

            for(let i = 0; i < actives.length; i++){
                const chat = (await database.chat.findMany({ 
                    where: { ownerID: actives[i].id }, 
                    orderBy: { created: "asc" }, 
                    include: { sender: {
                        include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } }
                })).map((init)=>{
                    return { ...init, sender: init.sender.credential };
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