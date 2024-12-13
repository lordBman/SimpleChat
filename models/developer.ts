import { HttpStatusCode } from "axios";
import { DBManager, SeedResult } from "../config";
import Database from "../config/database";
import { Developer, Organization, Project, Client, Credential, Admin } from "@prisma/client";
import ProjectModel from "./projects";
import ClientModel from "./clients";
import { uuid } from "../utils";

class DeveloperModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { admin: Credential, project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string }): Promise<Client & { credential: Credential } | undefined>{
        try{
            const client = await new ClientModel().create({ ...data, role: "developer" });
            if(client){
                await this.database.client.developer.create({ data: { credentialID: client.credentialID, adminID: data.admin.id } });
                await this.database.client.friend.create({ data: {
                    id: uuid(),
                    projectID: data.project.id, organizationID: data.organization?.id,
                    requesterID: client.credentialID, acceptorID: data.project.adminID!, accepted: true,
                } });

                await this.database.client.notification.create({
                    data: { 
                        recieverID: client.credentialID,
                        alert: `Hi ${data.name}, greetings from ${process.env.COMPANY_NAME}. my name is ${process.env.NAME}. Welcome to my Chat API platform. feel free to reach out to me if you want anything, I hope you enjoy using our services.`
                    }
                });

                await this.database.client.notification.create({
                    data: { 
                        recieverID: data.admin.id,
                        alert: `New developer named ${data.name}, say hi to him/her`
                    }
                });

                return client;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async delete(data: { credential: Credential, admin: Credential }): Promise<string | undefined>{
        try{
            await this.database.client.developer.delete({ where: { credentialID: data.credential.id } });
            await this.database.client.credential.delete({ where: { id: data.credential.id } });

            await this.database.client.notification.create({
                data: { 
                    recieverID: data.admin.id,
                    alert: `${data.credential.name} deleted his/her developer account`
                }
            });
            
            return "user was deleted successfully";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting user");
        }
    }

    async get(data: { project: Project, organization?: Organization, credential: Credential }): Promise<Developer & { projects: Project [] } | undefined>{
        try{
            const developer = await this.database.client.developer.findUnique({ where: { credentialID: data.credential.id } });
            const client = await new ClientModel().get(data);
            if(developer && client){
                const projects = await new ProjectModel().all({ developer });

                const init: Array<Project & { userCount: number }> = [];
                for(let index = 0; index < projects?.length!; index++){
                    const project = projects![index];

                    const userCount = await new ClientModel().count({ project });
                    init.push({ ...project, userCount: userCount! });
                }

                return { ...developer, ...client, projects: init };
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when initialing user");
        }
    }

    async all(data: { admin: Credential }): Promise<Developer[] | undefined>{
        try{
            const developers = await this.database.client.developer.findMany({
                where: { adminID: data.admin.id }, 
                include: { 
                    projects: { select: { id: true, name: true } }, 
                    credential: { select: { id: true, name: true, surname: true, email: true, username: true } }},
            });
            
            return developers;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting user");
        }
    }
}

export default DeveloperModel;