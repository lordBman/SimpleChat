import { uuid } from "../utils";
import Database from "./database";
import ErrorHandler from "./error";
import jetLogger from "jet-logger";

class DBManager{
    private static db: Database;

    private constructor(){}

    static instance = () =>{
        if(!DBManager.db){
            DBManager.db = new Database(new ErrorHandler());
            DBManager.db.connect();
        }
        return DBManager.db;
    }

    static disponse = () =>{
        if(DBManager.db){
            DBManager.db.client.$disconnect();
        }
    }
}

export class SeedResult{
    projectID: number;

    static result: SeedResult;

    private constructor(){}

    static set = (result: SeedResult) =>{
        SeedResult.result = result;
    }
    static instance = () => SeedResult.result;
}

export async function seed() {
    const database = DBManager.instance();
    
    let developer = await database.client.developer.findFirst({ where: { email: process.env.COMPANY_EMAIL!, name: process.env.COMPANY_NAME } });
    if(!developer){
        developer = await database.client.developer.create({ data: { id: uuid(), email: process.env.COMPANY_EMAIL!, name: process.env.COMPANY_NAME!, password: process.env.COMPANY_PASSWORD! } });
    }

    let project = await database.client.project.findFirst({ where: { name: process.env.PROJECT_NAME!, developerID: developer.id } });
    if(!project){
        project = await database.client.project.create({ data: { name: process.env.PROJECT_NAME!, accessToken: uuid(), developerID: developer.id } });
    }

    let admin = await database.client.user.findFirst({ where: { organization: process.env.COMPANY_NAME!, email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! } });
    if(admin){
        admin = await database.client.user.create({ data: {
            id: developer.id, projectID: project.id, name: process.env.NAME!, organization: process.env.COMPANY_NAME!,
            email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! } });
    }

    let accessKey = await database.client.accessKey.findFirst({ where:{ projectID: project?.id } });
    if(!accessKey){
        accessKey = await database.client.accessKey.create({ data: { projectID: project.id, name: "default", key: uuid(), enabled: true } });
    }

    SeedResult.set({ projectID: project.id });
    
    jetLogger.info(`${process.env.PROJECT_NAME} all set`);
}

export { DBManager };