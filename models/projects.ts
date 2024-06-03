import { Developer, Project } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";

class ProjectModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async all(data: { developer: Developer }): Promise<Project[] | undefined>{
        try{
            const projects = await this.database.client.project.findMany({ 
                where: { developerID: data.developer.id },
                include: { keys: true }
            });

            return projects;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while sending friend request");
        }
    }
}

export default ProjectModel;