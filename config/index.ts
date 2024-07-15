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
    organizationID: number

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

    let organization = await database.client.organization.upsert({ 
        where: { name_projectID: { name: process.env.COMPANY_NAME!, projectID: project.id } },
        update: {},
        create:  { name: process.env.COMPANY_NAME!, projectID: project.id }
    });
    let admin = await database.client.user.findFirst({ where: { organizationID: organization.id, email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! } });
    if(!admin){
        admin = await database.client.user.create({ data: {
            id: developer.id, projectID: project.id, name: process.env.COMPANY_NAME!, organizationID: organization.id,
            email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! } });
    }

    let accessKey = await database.client.accessKey.findFirst({ where:{ projectID: project?.id } });
    if(!accessKey){
        accessKey = await database.client.accessKey.create({ data: { projectID: project.id, name: "default", key: uuid(), enabled: true } });
    }

    database.client.developer.findMany().then(results=>{
        results.forEach((result)=>{
            console.log(JSON.stringify(result));
        });
    });

    database.client.user.findMany().then(results=>{
        results.forEach((result)=>{
            console.log(JSON.stringify(result));
        });
    });

    SeedResult.set({ projectID: project.id, organizationID: organization.id });
    
    jetLogger.info(`${process.env.PROJECT_NAME} all set Project ID: ${project.id} - Access Key: ${accessKey.key}`);
}

export { DBManager };