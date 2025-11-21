import {DBManager, Err} from "../config";
import {uuid} from "../utils";
import {AccessKey} from "@simplechat/shared/models";

class AccessKeyModel{
    database = DBManager.instance();

    async get(key: string): Promise<AccessKey>{
        try{
            return await this.database.accessKey.findUniqueOrThrow({
                where: {key}
            });
        }catch(error){
            throw new Err(503, error, "error encountered when getting access key");
        }
    }

    async default(projectID: string): Promise<AccessKey | null>{
        try{
            return await this.database.accessKey.findFirst({
                where: { projectID, default: true }
            });
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
            return await this.database.accessKey.create({
                data: {id: uuid(), key: uuid(), name: data.name, projectID: data.projectID}
            });
        }catch(error){
            throw new Err(503, error, "error encountered when generating access key");
        }
    }

    async rename(data: { accessID: string, name: string }): Promise<AccessKey>{
        try{
            return await this.database.accessKey.update({
                where: {id: data.accessID}, data: {name: data.name}
            });
        }catch(error){
            throw new Err(503, error, "error encountered when enabling access key");
        }
    }

    async activate(data: { accessID: string }): Promise<AccessKey>{
        try{
            return await this.database.accessKey.update({
                where: {id: data.accessID}, data: {enabled: true}
            });
        }catch(error){
            throw new Err( 503, error, "error encountered when enabling access key");
        }
    }

    async deactivate(data: { accessID: string }): Promise<AccessKey>{
        try{
            return await this.database.accessKey.update({
                where: {id: data.accessID}, data: {enabled: false}
            });
        }catch(error){
            throw new Err(503, error, "error encountered when disabling access key");
        }
    }

    async delete(data: { accessKeyID: string }): Promise<AccessKey>{
        try{
            return await this.database.accessKey.delete({
                where: {id: data.accessKeyID}
            });
        }catch(error){
            throw new Err(503, error, "error encountered when deleting access key");
        }
    }
}

export default AccessKeyModel;