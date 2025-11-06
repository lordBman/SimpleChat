import { DBManager, Err } from "../config";
import { uuid } from "../utils";
import { AccessKey, Project } from "@simplechat/shared";

class AccessKeyModel{
    database = DBManager.instance();

    async get(key: string): Promise<AccessKey>{
        try{
            const accessKey = await this.database.accessKey.findUniqueOrThrow({
                where: { key }
            });

            return accessKey;
        }catch(error){
            throw new Err(503, error, "error encountered when getting access key");
        }
    }

    async all(projectID: string): Promise<AccessKey[]>{
        try{
            const accessKey = await this.database.accessKey.findMany({
                where: { projectID: projectID }
            });

            return accessKey!;
        }catch(error){
            throw new Err(503, error, "error encountered when getting access key");
        }
    }

    async add(data: { name: string, projectID: string }): Promise<AccessKey>{
        try{
            const accessKey = await this.database.accessKey.create({
                data: { id: uuid(), key: uuid(), name: data.name,  projectID: data.projectID }
            });

            return accessKey;
        }catch(error){
            throw new Err(503, error, "error encountered when generating access key");
        }
    }

    async rename(data: { accessID: string, name: string }): Promise<AccessKey>{
        try{
            const key = await this.database.accessKey.update({
                where : { id: data.accessID }, data: { name: data.name }
            });

            return key;
        }catch(error){
            throw new Err(503, error, "error encountered when enabling access key");
        }
    }

    async activate(data: { accessID: string }): Promise<AccessKey>{
        try{
            const init = await this.database.accessKey.update({
                where : { id: data.accessID }, data: { enabled: true }
            });

            return init;
        }catch(error){
            throw new Err( 503, error, "error encountered when enabling access key");
        }
    }

    async deactivate(data: { accessID: string }): Promise<AccessKey>{
        try{
            const init = await this.database.accessKey.update({
                where : { id: data.accessID }, data: { enabled: false }
            });

            return init;
        }catch(error){
            throw new Err(503, error, "error encountered when disabling access key");
        }
    }

    async delete(data: { accessKeyID: string }): Promise<AccessKey>{
        try{
            const database = DBManager.instance();
            
            const init = await this.database.accessKey.delete({
                where : { id: data.accessKeyID }
            });

            return init;
        }catch(error){
            throw new Err(503, error, "error encountered when deleting access key");
        }
    }
}

export default AccessKeyModel;