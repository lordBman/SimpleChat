import { Project } from "@simplechat/shared/models";
import { DBManager, Err } from "../config";
import { ResourceType } from "@prisma/client";
import Organization from "@simplechat/shared/models/organization";

class OrganizationModel{
    async create(data: { project: Project, name: string }): Promise<Organization>{
        const database = DBManager.instance();
        
        try{
            const organization = await database.organization.create({ 
                data: { projectID: data.project.id, name: data.name }
            });

            return organization;
        }catch(error){
            throw new Err(503, error, "error encountered while creating details");
        }
    }

    async get(data: { project: Project, name: string }): Promise<Organization>{
        try{
            const database = DBManager.instance();

            const organization = await database.organization.findUniqueOrThrow({ 
                where: { name_projectID: { projectID: data.project.id, name: data.name } }
            });

            return organization;
        }catch(error){
            throw new Err(503, error, "error encountered while getting organization details");
        }
    }

    async all(data: { project: Project }): Promise<Organization[]>{
        try{
            const database = DBManager.instance();

            const organizations = await database.organization.findMany({ 
                where: { projectID: data.project.id }
            });

            return organizations;
        }catch(error){
            throw new Err(503, error, "error encountered while loading Organization list");
        }
    }

    async delete(data: { project: Project, groupID: string }): Promise<Organization>{
        try{
            const database = DBManager.instance();

            const organization = await database.organization.update({ 
                where: { projectID: data.project.id, id: data.groupID },
                data: { isDeleted: true  }
            });

            await database.deleted.create({ data: { resourceID: organization.id, type: ResourceType.Organization } });

            return organization;
        }catch(error){
            throw new Err(503, error, "error encountered while delteting Organization");
        }
    }
}

export default OrganizationModel;