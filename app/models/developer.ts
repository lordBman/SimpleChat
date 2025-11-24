import {DBManager, Err, SeedResult} from "../config";
import { UserState} from "@simplechat/shared";
import {AccessKey, Project, User } from "@simplechat/shared/models";
import ProjectModel from "./projects";
import AccessKeyModel from "./access-keys";

class DeveloperModel{
    database = DBManager.instance();

    async create(data: { name: string, surname: string, email: string, username: string, password: string }): Promise<User>{
        try{
            const exists = await this.database.credential.count({ where: { email: data.email } });
            if (exists <= 0) {
                const credential = await this.database.credential.create({data: { ...data}});
                const details = await this.database.details.create({  data: { id: credential.id, ...data } });
                const user = await this.database.user.create({data: {id: details.id}});
                await this.database.notification.create({
                    data: {
                        recieverID: SeedResult.instance().adminID, nType: "User",
                        alert: `New developer named ${data.name}, say hi to him/her`
                    }
                });
                return {...user, details};
            }
            throw new Err(403, "", "another user with the same email exists");
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

            const init: Array<Project & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await this.database.client.count({ where: { projectID: project.id! }});
                init.push({ ...project, userCount: userCount! });
            }

            let defaults: { key: AccessKey, projectToken: string, organization?: string } | undefined = undefined;
            const defaultProject = await this.database.project.findUniqueOrThrow({ where: { id: SeedResult.instance().projectID } });
            const defaultOrg = await this.database.organization.findUniqueOrThrow({ where: { id: SeedResult.instance().organizationID } });
            const defaultKey = await new AccessKeyModel().default(defaultProject.id);
            if(defaultKey){
                defaults = { key: defaultKey, projectToken: defaultProject.token, organization: defaultOrg.id };
            }

            return { ...data.user, projects: init, defaults };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when initialing user");
        }
    }

    async signin(data: { email: string, password: string }): Promise<User>{
        try{
            const credentials = await this.database.credential.findUnique({ where: { email: data.email } });
            if(credentials){
                if(data.password === credentials.password){
                    console.log(JSON.stringify(data.password));
                    return await this.database.user.findUniqueOrThrow({
                        where: {id: credentials.id},
                        include: {details: true}
                    });
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