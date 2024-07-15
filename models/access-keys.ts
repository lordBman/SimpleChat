import { AccessKey, Project } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";

class AccessKeyModel{
    database: Database = DBManager.instance();

    async get(key: string): Promise<AccessKey & { project: Project } | undefined>{
        try{
            const accessKey = await this.database.client.accessKey.findFirst({
                where: { key }, include: { project: true }
            });

            return accessKey!;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting access key");
        }
    }

    async all(projectID: number): Promise<AccessKey[] | undefined>{
        try{
            const accessKey = await this.database.client.accessKey.findMany({
                where: { projectID: projectID }
            });

            return accessKey!;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting access key");
        }
    }

    async add(data: { name: string, projectID: number }): Promise<AccessKey | undefined>{
        try{
            const accessKey = await this.database.client.accessKey.create({
                data: { key: uuid(), name: data.name,  projectID: data.projectID }
            });

            return accessKey;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when generating access key");
        }
    }

    async rename(data: { key: string, name: string }): Promise<string | undefined>{
        try{
            await this.database.client.accessKey.update({
                where : { key: data.key }, data: { name: data.name }
            });

            return "Access Key renaming successfull";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when enabling access key");
        }
    }

    async activate(data: { key: string }): Promise<string | undefined>{
        try{
            await this.database.client.accessKey.update({
                where : { key: data.key }, data: { enabled: true }
            });

            return "Access Key enabling successfull";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when enabling access key");
        }
    }

    async deactivate(data: { key: string }): Promise<string | undefined>{
        try{
            await this.database.client.accessKey.update({
                where : { key: data.key }, data: { enabled: false }
            });

            return "Access Key disabling successfull";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when disabling access key");
        }
    }

    async delete(data: { key: string }): Promise<string | undefined>{
        try{
            await this.database.client.accessKey.delete({
                where : { key: data.key }
            });

            return "Access Key deletion successfull";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting access key");
        }
    }
}

export default AccessKeyModel;