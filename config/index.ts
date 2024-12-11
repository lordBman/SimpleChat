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
    
    let credential = await database.client.credential.findFirst({ where: { email: process.env.COMPANY_EMAIL!, name: process.env.NAME, surname: process.env.SURNAME } });
    if(!credential){
        credential = await database.client.credential.create({ data: { id: uuid(), email: process.env.COMPANY_EMAIL!, name: process.env.NAME!, surname: process.env.SURNAME!, password: process.env.COMPANY_PASSWORD!, role: "admin" } });
    }

    let admin = await database.client.admin.upsert({ 
        where: { credentialID: credential.id },
        update: {},
        create: { credentialID: credential.id }
    });

    let project = await database.client.project.upsert({ 
        where: { name: process.env.PROJECT_NAME! },
        update: {},
        create: { name: process.env.PROJECT_NAME!, adminID: admin.credentialID, accessToken: uuid() }
    });

    let organization = await database.client.organization.upsert({ 
        where: { name_projectID: { name: process.env.COMPANY_NAME!, projectID: project.id } },
        update: {},
        create:  { name: process.env.COMPANY_NAME!, projectID: project.id }
    });
    
    await database.client.client.upsert({
        where: { credentialID: admin.credentialID }, update: {}, create: { credentialID: admin.credentialID, organizationID: organization.id, projectID: project.id } 
    });

    await database.client.user.upsert({
        where: { id: admin.credentialID }, update: {}, create: { id: admin.credentialID } 
    });

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