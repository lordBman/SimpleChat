import { AccessKey, Project } from "@prisma/client";
import { DBManager, Err } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";

class AccessKeyModel{
    database: Database = DBManager.instance();

    async get(key: string){
        try{
            const accessKey = await this.database.client.accessKey.findUniqueOrThrow({
                where: { key }, include: { project: { include: { 
                    admin: { include: { credential: { select: { id: true, name: true, surname: true, username: true, email: true } } } },
                    developer: { include: { credential: { select: { id: true, name: true, surname: true, username: true, email: true } } } }
                } } }
            });

            return accessKey;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when getting access key");
        }
    }

    async all(projectID: string): Promise<AccessKey[]>{
        try{
            const accessKey = await this.database.client.accessKey.findMany({
                where: { projectID: projectID }
            });

            return accessKey!;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when getting access key");
        }
    }

    async add(data: { name: string, projectID: string }): Promise<AccessKey>{
        try{
            const accessKey = await this.database.client.accessKey.create({
                data: { id: uuid(), key: uuid(), name: data.name,  projectID: data.projectID }
            });

            return accessKey;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when generating access key");
        }
    }

    async rename(data: { accessID: string, name: string }): Promise<string>{
        try{
            await this.database.client.accessKey.update({
                where : { id: data.accessID }, data: { name: data.name }
            });

            return "Access Key renaming successfull";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when enabling access key");
        }
    }

    async activate(data: { accessID: string }): Promise<string>{
        try{
            await this.database.client.accessKey.update({
                where : { id: data.accessID }, data: { enabled: true }
            });

            return "Access Key enabling successfull";
        }catch(error){
            throw new Err( HttpStatusCode.InternalServerError, error, "error encountered when enabling access key");
        }
    }

    async deactivate(data: { accessID: string }): Promise<string>{
        try{
            await this.database.client.accessKey.update({
                where : { id: data.accessID }, data: { enabled: false }
            });

            return "Access Key disabling successfull";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when disabling access key");
        }
    }

    async delete(data: { accessID: string }): Promise<string>{
        try{
            await this.database.client.accessKey.delete({
                where : { id: data.accessID }
            });

            return "Access Key deletion successfull";
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when deleting access key");
        }
    }
}

export default AccessKeyModel;