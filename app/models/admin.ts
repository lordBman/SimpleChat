import {DBManager, Err} from "../config";
import ProjectModel from "./projects";
import DeveloperModel from "./developer";
import {Developer, Project, UserState} from "@simplechat/shared";
import {User} from "@simplechat/shared/models";

class AdminModel{
    database = DBManager.instance();

    async delete(admin: User): Promise<string>{
        try{
            await this.database.credential.delete({ where: { id: admin.id} });
            
            return "user was deleted successfully";
        }catch(error){
            throw new Err(503, `${error}`, "error encountered when creating user");
        }
    }

    async get(data: { user: User }): Promise<Omit<UserState, "token">>{
        try{
            const developers = await this.developers({ admin: data.user });
            const projects = await new ProjectModel().all({ user: data.user });

            const init: Array<Project & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await this.database.client.count({ where: { projectID: project.id! }});
                init.push({ ...project, userCount: userCount! });
            }

            return { ...data.user, projects: init, developers: developers.map((developer)=> developer.details) };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when initialing user");
        }
    }

    async developers(data: { admin: User }): Promise<Developer[]>{
        if(data.admin.role !== "Admin"){
            throw new Err(403, "forbidden", "only admins can get developer lists");
        }

        try{
            return await this.database.user.findMany({
                where: {adminID: data.admin.id},
                include: {details: true}
            }).then(async (users) => {
                const init: Developer[] = [];
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    const projects = await new ProjectModel().all({user});

                    init.push({...user, projects});
                }
                return init;
            });
        }catch(error){
            throw new Err(503, error, "error encountered when getting developers");
        }
    }
}

export default AdminModel;