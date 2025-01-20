import { Organization, Project } from "@prisma/client";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";

class OrganizationModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { project: Project, name: string }): Promise<Organization>{
        try{
            const organization = await this.database.client.organization.create({ 
                data: { projectID: data.project.id, name: data.name }
            });

            return organization;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while creating details");
        }
    }

    async get(data: { project: Project, name: string }): Promise<Organization>{
        try{
            const organization = await this.database.client.organization.findUniqueOrThrow({ 
                where: { name_projectID: { projectID: data.project.id, name: data.name } }
            });

            return organization;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while getting organization details");
        }
    }

    async all(data: { project: Project }): Promise<Organization[]>{
        try{
            const organizations = await this.database.client.organization.findMany({ 
                where: { projectID: data.project.id }
            });

            return organizations;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while loading Organization list");
        }
    }

    async delete(data: { project: Project, groupID: string }): Promise<string>{
        try{
            const organizations = await this.database.client.organization.delete({ 
                where: { projectID: data.project.id, id: data.groupID }
            });

            return "organization deletion successful";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while delteting Organization");
        }
    }
}

export default OrganizationModel;