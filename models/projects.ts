import { Admin, Developer, Project } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";

class ProjectModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async all(data: { developer?: Developer , admin?: Developer | Admin}): Promise<Project[] | undefined>{
        try{
            const projects = await this.database.client.project.findMany({ 
                where: { developerID: data.developer?.credentialID, adminID: data.admin?.credentialID },
                include: { keys: true }
            });

            return projects;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while loading project list");
        }
    }
}

export default ProjectModel;