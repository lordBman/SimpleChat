import { HttpStatusCode } from "axios";
import { DBManager, Err, SeedResult } from "../config";
import Database from "../config/database";
import { Organization, Project, Client, Credential } from "@prisma/client";
import ProjectModel from "./projects";
import ClientModel from "./clients";
import { uuid } from "../utils";

class DeveloperModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { admin: Credential, project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string }): Promise<Client & { credential: Partial<Credential> }>{
        try{
            const client = await new ClientModel().create({ ...data, role: "Developer" });

            await this.database.client.notification.create({
                data: { 
                    recieverID: data.admin.id,
                    alert: `New developer named ${data.name}, say hi to him/her`
                }
            });

            return client;
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential }): Promise<Partial<Credential> & { projects: Partial<Project> [] }>{
        try{
            const client = await new ClientModel().get(data);
            
            const projects = await new ProjectModel().all({ credential: data.credential });

            const init: Array<Partial<Project> & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await this.database.client.client.count({ where: { projectID: project.id! }});
                init.push({ ...project, userCount: userCount! });
            }

            return { ...data.credential, ...client, projects: init };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when initialing user");
        }
    }

    async all(data: { admin: Credential }): Promise<Partial<Credential>[]>{
        try{
            const developers = (await this.database.client.credential.findMany({
                where: { adminID: data.admin.id }, 
                include: { 
                    projects: { select: { id: true, name: true } }
                }
            })).map((developer) => { return { ...developer, password: "" }; });
            
            return developers;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when getting developers");
        }
    }
}

export default DeveloperModel;