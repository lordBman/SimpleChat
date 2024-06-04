import { HttpStatusCode } from "axios";
import { DBManager, SeedResult } from "../config";
import Database from "../config/database";
import jwt from "jsonwebtoken";
import { uuid } from "../utils";
import { Developer, Project } from "@prisma/client";
import ProjectModel from "./projects";
import { UserModel } from ".";

class DeveloperModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { name: string, email: string, password: string }): Promise<string | undefined>{
        try{
            const developer = await this.database.client.developer.create({ data: { id: uuid(), ...data }, select: { id: true, name: true, email: true } });

            const init = await this.database.client.user.create({ 
                data: { id: developer.id, organization: process.env.COMPANY_NAME!, projectID:  SeedResult.instance().projectID, ...data },
                select: { id: true, name: true, email: true } });

            const token = jwt.sign({ user: init }, process.env.SECRET || "test", { expiresIn: "7 days" } );

            return token;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async signin(data: { email: string, password: string }): Promise<string | undefined>{
        try{
            const init = await this.database.client.developer.findFirst({ where: { email: data.email } });
            if(init){
                if(data.password === init.password){
                    console.log(JSON.stringify(data.password));
                    const token = jwt.sign({ user: { ...init, password: undefined }}, process.env.SECRET || "test", { expiresIn: "7 days" } );
                    return token;
                }
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "incorrect password, check and try again");
            }
            this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "account does not exists, try signing up");
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting user");
        }
    }

    async delete(developer: Developer): Promise<string | undefined>{
        try{
            await this.database.client.user.delete({ where: { id: developer.id } });
            await this.database.client.developer.delete({ where: { id: developer.id } });

            return "user was deleted successfully";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async get(developer: Developer): Promise<Developer & { projects: Project [] } | undefined>{
        try{
            const projects = await new ProjectModel().all({ developer });

            const init: Array<Project & { userCount: number }> = [];
            for(let index = 0; index < projects?.length!; index++){
                const project = projects![index];

                const userCount = await new UserModel().count({ project });
                init.push({ ...project, userCount: userCount! });
            }

            return { ...developer, projects: init };
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }
}

export default DeveloperModel;