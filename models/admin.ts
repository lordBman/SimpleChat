import { HttpStatusCode } from "axios";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { Developer, Organization, Project, Credential, Admin } from "@prisma/client";
import ProjectModel from "./projects";
import ClientModel from "./clients";
import DeveloperModel from "./developer";

class AdminModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async delete(admin: Admin): Promise<string>{
        try{
            await this.database.client.admin.delete({ where: admin });
            await this.database.client.credential.delete({ where: { id: admin.credentialID } });
            
            return "user was deleted successfully";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential }): Promise<Admin & { projects: Project [], developers: Developer[] }>{
        try{
            const admin = await this.database.client.admin.findUniqueOrThrow({ where: { credentialID: data.credential.id } });
            const client = await new ClientModel().get(data);
            const developers = await new DeveloperModel().all({ admin: data.credential });

            const projects = await new ProjectModel().all({ credential: data.credential });

            const init: Array<Project & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await new ClientModel().count({ project });
                init.push({ ...project, userCount: userCount! });
            }

            return { ...admin, ...client, projects: init, developers };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when initialing user");
        }
    }
}

export default AdminModel;