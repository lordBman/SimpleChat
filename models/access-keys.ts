import { AccessKey, Project } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";

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
}

export default AccessKeyModel;