import { HttpStatusCode } from "axios";
import { DBManager, Err } from "../config";
import ProjectModel from "./projects";
import ClientModel from "./clients";
import DeveloperModel from "./developer";
import { Project, Credential, Organization, UserState } from "@simplechat/shared";

class AdminModel{
    async delete(admin: Credential): Promise<string>{
        try{
            const database = await DBManager.instance();

            await database.credential.delete({ where: { id: admin.id} });
            
            return "user was deleted successfully";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential }): Promise<Omit<UserState, "token">>{
        try{
            const database = await DBManager.instance();
            
            const client = await new ClientModel().get(data);
            const developers = await new DeveloperModel().all({ admin: data.credential });

            const projects = await new ProjectModel().all({ credential: data.credential });

            const init: Array<Project & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await database.client.count({ where: { projectID: project.id! }});
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