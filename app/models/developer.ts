import { DBManager, Err, SeedResult } from "../config";
import { Developer, Project, User, UserState } from "@simplechat/shared";
import {  AccessKey, UserRoles } from "@simplechat/shared/models";
import ProjectModel from "./projects";

class DeveloperModel{
    database = DBManager.instance();

    async create(data: { name: string, surname: string, email?: string, username?: string, password: string }): Promise<User>{
        try{
            const details = await this.database.details.create({ data });
            await this.database.credential.create({ data: { id: details.id, ...data } });
            const user = await this.database.user.create({ data: { id: details.id } });
            await this.database.notification.create({
                data: { 
                    recieverID: SeedResult.instance().adminID, nType: "User",
                    alert: `New developer named ${data.name}, say hi to him/her`
                }
            });
            return { ...user, details };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when creating user");
        }
    }

    async get(data: { user: User }): Promise<Omit<UserState, "token">>{
        try{
            const projects = await new ProjectModel().all({ user: data.user });

            const init: Array<Project & { keys: AccessKey[], userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await this.database.client.count({ where: { projectID: project.id! }});
                const keys = await this.database.accessKey.findMany({ where: { projectID: project.id } });

                init.push({ ...project, keys, userCount: userCount! });
            }

            return { projects: init };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when initialing user");
        }
    }

    async all(data: { admin: User }): Promise<Developer[]>{
        if(data.admin.role !== "Admin"){
            throw new Err(403, "forbidden", "only admins can get developer lists");
        }

        try{
            const developers = await this.database.user.findMany({
                where: { adminID: data.admin.id }, 
                include: { details: true }
            }).then(async(users)=>{
                const init: Developer[] = [];
                for(let i = 0; i < users.length; i++){
                    const user = users[i];
                    const projects = await new ProjectModel().all({ user });

                    init.push({ ...user, projects });
                }
                return init;
            });
            return developers;
        }catch(error){
            throw new Err(503, error, "error encountered when getting developers");
        }
    }

    async signin(data: { email?: string, username?: string, password: string }): Promise<User>{
        try{
            const credentials = await this.database.credential.findMany({ where: { OR: [ { email: data.email} , { username: data.username } ] } });
            if(credentials.length > 0){
                for(var i = 0; i < credentials.length; i++){
                    const credential = credentials[i];
                    if(data.password === credential.password){
                        console.log(JSON.stringify(data.password));
                        const user = await this.database.user.findUniqueOrThrow({ 
                            where: { id: credential.id },
                            include: { details: true }
                        });
                        return user;
                    }
                }
                throw new Err(401, ``, "incorrect password, check and try again");
            }
            throw new Err(401, ``, "account does not exists, try signing up");
        }catch(error){
            throw new Err(503, error, "error encountered when getting user");
        }
    }
}

export default DeveloperModel;