import { Credential, Project, AccessKey, ProjectDetails, Group } from "@simplechat/shared";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";
import { ResourceType } from "@prisma/client";

class ProjectModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { credentials: Credential , name: string }): Promise<Project & { keys: AccessKey[] }>{
        try{
            let project = await this.database.client.project.create({ 
                data: { name: data.name, ownerID: data.credentials.id, },
                select: { id: true, name: true, token: true }
            });
        
            const key = await this.database.client.accessKey.create({ data: { projectID: project.id, name: "default", key: uuid(), enabled: true } });

            return { ...project, owner: data.credentials, keys: [key] };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }

    async get(data: { credential: Credential, projectID: string }): Promise<ProjectDetails>{
        try{
            const project = await this.database.client.project.findUniqueOrThrow({ 
                where: { id: data.projectID, ownerID: data.credential.id },
                include: { 
                    keys: true,
                    groups: { include: { creator: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                    clients: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    organizations: { include: {
                        groups: { include: { creator: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } } },
                        clients: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } },
                    } },
                    owner: { select: { id: true, name: true, surname: true, email: true, username: true } }
                }
            });

            const groups = project.groups.map((group)=>{
                return { ...group, creator: group.creator.credential }
            });

            const clients = project.clients.map((client)=>{
                return { ...client.credential }
            });

            const organizations = project.organizations.map((org)=> {
                const groups: Group[] = org.groups.map((group)=>{
                    return { ...group, creator: group.creator.credential }
                });
    
                const clients: Credential[] = org.clients.map((client)=>{
                    return { ...client.credential }
                });

                return { ...org, groups, clients }
            })

            return { ...project, groups, clients, organizations };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading project list");
        }
    }

    async all(data: { credential: Credential }): Promise<Project[]>{
        try{
            const projects = await this.database.client.project.findMany({ 
                where: { ownerID: data.credential.id, isDeleted: false },
                include: { 
                    keys: { select: { id: true, name: true, enabled: true } },
                    owner: { select: { id: true, name: true, surname: true, email: true, username: true } }
                }
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