import { Credential, Project } from "@prisma/client";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";

class ProjectModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { credentials: Credential , name: string }): Promise<Project>{
        try{
            let project = await this.database.client.project.create({ 
                data: { name: data.name, ownerID: data.credentials.id, }
            });
        
            await this.database.client.accessKey.create({ data: { projectID: project.id, name: "default", key: uuid(), enabled: true } });

            return project;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }

    async get(data: { credential: Credential, projectID: number }): Promise<Project>{
        try{
            const projects = await this.database.client.project.findUniqueOrThrow({ 
                where: { id: data.projectID, ownerID: data.credential.id },
                include: { 
                    keys: { select: { id: true, name: true, enabled: true } },
                    groups: true,
                    clients: { include: { credential: { select: { name: true, surname: true, email: true, username: true } } } },
                    organizations: { include: {
                        groups: true,
                        clients: { include: { credential: { select: { name: true, surname: true, email: true, username: true } } } },
                    } }
                }
            });

            return projects;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }

    async all(data: { credential: Credential }): Promise<Project[]>{
        try{
            const projects = await this.database.client.project.findMany({ 
                where: { ownerID: data.credential.id },
                include: { keys: { select: { id: true, name: true, enabled: true } } }
            });

            return projects;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }
}

export default ProjectModel;