import { HttpStatusCode } from "axios";
import { DBManager, SeedResult } from "../config";
import Database from "../config/database";
import jwt from "jsonwebtoken";
import { uuid } from "../utils";
import { Developer, Organization, Project, Client, Credential } from "@prisma/client";
import ProjectModel from "./projects";
import { UserModel } from ".";
import ClientModel from "./clients";

class DeveloperModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string }): Promise<Client & { credential: Credential } | undefined>{
        try{
            const client = await new ClientModel().create({ ...data, role: "developer" });
            if(client){
                await this.database.client.developer.create({ data: { credentialID: client.credentialID, adminID: data.project.adminID! } });

                return client;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async delete(developer: Developer): Promise<string | undefined>{
        try{
            await this.database.client.developer.delete({ where: developer });
            await this.database.client.credential.delete({ where: { id: developer.credentialID } });
            
            return "user was deleted successfully";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(developer: Developer): Promise<Developer & { projects: Project [] } | undefined>{
        try{
            const projects = await new ProjectModel().all({ developer });

            const init: Array<Project & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await new UserModel().count({ project });
                init.push({ ...project, userCount: userCount! });
            }

            return { ...developer, projects: init };
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }
}

export default DeveloperModel;