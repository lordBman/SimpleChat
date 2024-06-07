import { Organization, Project } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";

class OrganizationModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async get(data: { project: Project, name: string }): Promise<Organization | undefined>{
        try{
            const organization = await this.database.client.organization.findUnique({ 
                where: { name_projectID: { projectID: data.project.id, name: data.name } }
            });

            if(organization){
                return organization;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while organization details");
        }
    }

    async all(data: { project: Project }): Promise<Organization[] | undefined>{
        try{
            const organizations = await this.database.client.organization.findMany({ 
                where: { projectID: data.project.id }
            });

            return organizations;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while loading Organization list");
        }
    }
}

export default OrganizationModel;