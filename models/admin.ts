import { HttpStatusCode } from "axios";
import { DBManager, SeedResult } from "../config";
import Database from "../config/database";
import { Developer, Organization, Project, Client, Credential, Admin } from "@prisma/client";
import ProjectModel from "./projects";
import ClientModel from "./clients";

class AdminModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string }): Promise<Client & { credential: Credential } | undefined>{
        try{
            const client = await new ClientModel().create({ ...data, role: "admin" });
            if(client){
                await this.database.client.admin.create({ data: { credentialID: client.credentialID } });

                return client;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async delete(admin: Admin): Promise<string | undefined>{
        try{
            await this.database.client.admin.delete({ where: admin });
            await this.database.client.credential.delete({ where: { id: admin.credentialID } });
            
            return "user was deleted successfully";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential }): Promise<Admin & { projects: Project [] } | undefined>{
        try{
            const admin = await this.database.client.admin.findUnique({ where: { credentialID: data.credential.id } });
            const client = await new ClientModel().get(data);
            if(admin && client){
                const projects = await new ProjectModel().all({ admin });

                const init: Array<Project & { userCount: number }> = [];
                for(let index = 0; index < projects?.length!; index++){
                    const project = projects![index];

                    const userCount = await new ClientModel().count({ project });
                    init.push({ ...project, userCount: userCount! });
                }

                return { ...admin, ...client, projects: init };
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when initialing user");
        }
    }
}

export default AdminModel;