import {  Project, AccessKey, Group } from "@simplechat/shared/models";
import { DBManager, Err } from "../config";
import { uuid } from "../utils";
import { Details, ResourceType } from "@prisma/client";
import { User } from "@simplechat/shared/models";
import { ProjectDetails } from "@simplechat/shared";

class ProjectModel{
    database = DBManager.instance();

    async create(data: { user: User , name: string }): Promise<Project & { keys: AccessKey[] }>{
        try{
            const project = await this.database.project.create({ 
                data: { name: data.name, ownerID: data.user.id, },
            });
        
            const key = await this.database.accessKey.create({ data: { projectID: project.id, name: "default", key: uuid(), enabled: true, default: true } });

            return { ...project, owner: data.user.details, keys: [key] };
        }catch(error){
            throw new Err(503, error, "error encountered while loading project list");
        }
    }

    async get(data: { user: User, projectID: string }): Promise<ProjectDetails>{
        try{
            const project = await this.database.project.findUniqueOrThrow({ 
                where: { id: data.projectID, ownerID: data.user.id },
                include: { 
                    keys: true,
                    groups: { include: { creator: { include: { details: true } } } }, clients: { include: { details: true } },
                    organizations: { include: {
                        groups: { include: { creator: { include: { details: true } } } }, clients: { include: { details: true } },
                    } },
                    owner: { include: { details: true } }
                }
            });

            const groups = project.groups.map((group)=>{ return { ...group, creator: group.creator.details }});
            const clients = project.clients.map((client)=>{ return { ...client.details } });
            const organizations = project.organizations.map((org)=> {
                const groups: Group[] = org.groups.map((group)=>{ return { ...group, creator: group.creator.details } });
                const clients: Details[] = org.clients.map((client)=>{ return { ...client.details } });

                return { ...org, groups, clients }
            })

            return { ...project, groups, clients, organizations, owner: project.owner.details };
        }catch(error){
            throw new Err(503, error, "error encountered while loading project list");
        }
    }

    async getByToken(token: string): Promise<Project| undefined>{
        try{
            const project = await this.database.project.findUnique({ 
                where: { token },
                include: { keys: true, owner: { include: { details: true } }}
            });

            if(project){
                return { ...project, owner: project.owner.details };
            }else{
                throw new Err(404, "", "no project found with provided token");
            }
        }catch(error){
            throw new Err(503, error, "error encountered while loading project list");
        }
    }

    async all(data: { user: User }): Promise<Project[]>{
        try{
            const projects = await this.database.project.findMany({ 
                where: { ownerID: data.user.id, isDeleted: false },
                include: { 
                    keys: { select: { id: true, name: true, enabled: true } },
                    owner: { include: { details: true } }
                }
            });

            return projects.map((project) => { return {...project, owner: project.owner.details, isDeleted: undefined} });
        }catch(error){
            throw new Err( 500, error, "error encountered while loading project list");
        }
    }

    async delete(data: { user: User, projectID: string }): Promise<{projectID: string, message: string}>{
        try{ 
            const project = await this.database.project.update({ 
                where: { id: data.projectID, ownerID: data.user.id },
                data: { isDeleted: true }
            });

            await this.database.deleted.create({ data: { resourceID: project.id, type: ResourceType.Project } });

            return { projectID: project.id, message: "Project deletion successfull" };
        }catch(error){
            throw new Err(503, error, "error encountered while loading project list");
        }
    }
}

export default ProjectModel;