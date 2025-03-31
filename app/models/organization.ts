import { Organization, Project } from "@simplechat/shared";
import { DBManager, Err } from "../config";
import { HttpStatusCode } from "axios";
import { ResourceType } from "@prisma/client";

class OrganizationModel{
    async create(data: { project: Project, name: string }): Promise<Organization>{
        const database = await DBManager.instance();
        
        try{
            const organization = await database.organization.create({ 
                data: { projectID: data.project.id, name: data.name }
            });

            return organization;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while creating details");
        }
    }

    async get(data: { project: Project, name: string }): Promise<Organization>{
        try{
            const database = await DBManager.instance();

            const organization = await database.organization.findUniqueOrThrow({ 
                where: { name_projectID: { projectID: data.project.id, name: data.name } }
            });

            return organization;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while getting organization details");
        }
    }

    async all(data: { project: Project }): Promise<Organization[]>{
        try{
            const database = await DBManager.instance();

            const organizations = await database.organization.findMany({ 
                where: { projectID: data.project.id }
            });

            return organizations;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading Organization list");
        }
    }

    async delete(data: { project: Project, groupID: string }): Promise<{organizationID: string, message: string}>{
        try{
            const database = await DBManager.instance();

            const organization = await database.organization.update({ 
                where: { projectID: data.project.id, id: data.groupID },
                data: {  }
            });

            await database.deleted.create({ data: { resourceID: organization.id, type: ResourceType.Organization } });

            return { organizationID: organization.id, message: "organization deletion successful" };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while delteting Organization");
        }
    }
}

export default OrganizationModel;