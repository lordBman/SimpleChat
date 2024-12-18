import { HttpStatusCode } from "axios";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { Organization, Project, Credential } from "@prisma/client";
import ProjectModel from "./projects";
import ClientModel from "./clients";
import DeveloperModel from "./developer";

class AdminModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async delete(admin: Credential): Promise<string>{
        try{
            await this.database.client.credential.delete({ where: { id: admin.id} });
            
            return "user was deleted successfully";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential }): Promise<Credential & { projects: Project [], developers: Credential[] }>{
        try{
            const client = await new ClientModel().get(data);
            const developers = await new DeveloperModel().all({ admin: data.credential });

            const projects = await new ProjectModel().all({ credential: data.credential });

            const init: Array<Project & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await new ClientModel().count({ project });
                init.push({ ...project, userCount: userCount! });
            }

            return { ...data.credential, ...client, projects: init, developers };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when initialing user");
        }
    }
}

export default AdminModel;