import { Credential, Project, ResourceType, AccessKey } from "@prisma/client";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";

class ProjectModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { credentials: Credential , name: string }): Promise<Partial<Project & { keys: AccessKey[] }>>{
        try{
            let project = await this.database.client.project.create({ 
                data: { name: data.name, ownerID: data.credentials.id, },
                select: { id: true, name: true, token: true, ownerID: true }
            });
        
            const key = await this.database.client.accessKey.create({ data: { projectID: project.id, name: "default", key: uuid(), enabled: true } });

            return { ...project, keys: [key] };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }

    async get(data: { credential: Credential, projectID: string }): Promise<Partial<Project>>{
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

    async all(data: { credential: Credential }): Promise<Partial<Project>[]>{
        try{
            const projects = await this.database.client.project.findMany({ 
                where: { ownerID: data.credential.id, isDeleted: false },
                include: { keys: { select: { id: true, name: true, enabled: true } } }
            });

            return projects.map((project) => { return {...project, isDeleted: undefined} });
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }

    async delete(data: { credential: Credential, projectID: string }): Promise<{message: string}>{
        try{
            const project = await this.database.client.project.findUniqueOrThrow({ 
                where: { id: data.projectID, ownerID: data.credential.id },
            });

            await this.database.client.deleted.create({ data: { resourceID: project.id, type: ResourceType.Project } });

            return { message: "Project deletion successfull" };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }
}

export default ProjectModel;