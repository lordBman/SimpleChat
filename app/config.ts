import { HttpStatusCode } from "axios";
import { uuid } from "./utils";
import jetLogger from "jet-logger";
import { PrismaClient } from "@prisma/client";

const connect = (): PrismaClient => {
    const client = new PrismaClient({ log: [{ level: 'query', emit: 'event' }], });
    client.$connect().catch((error)=>{
        if(error){
            jetLogger.err("Error connecting to database");
        }
    });
    return client;
}

export class Err extends Error{
    code : HttpStatusCode;
    error: any; 

    constructor(code : HttpStatusCode, error: any, message: string){
        super(message);

        this.code = code;
        this.error = error;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

class DBManager{
    private static __db?: PrismaClient;

    private constructor() {}

    static instance(): PrismaClient{
        if(!DBManager.__db){
            try{
                DBManager.__db = connect();
                return DBManager.__db!;
            }catch(error){
                throw error;
            }
        }else{
            return DBManager.__db!;
        }
    }

    static disponse = () =>{
        DBManager.__db?.$disconnect();
    }
}

type Seed = {
    projectID: string;
    organizationID: string
} 

export class SeedResult{
    static seed?: Seed;

    private constructor(){}

    static set = (result: { projectID: string, organizationID: string }) =>{
        SeedResult.seed = result;
    }

    static instance = () => {
        if(SeedResult.seed){
            return SeedResult.seed;
        }
        throw Error("Seeed values no set");
    }
}

export async function seed() {
    jetLogger.info("initializing seeding: connecting to database");
    const database = DBManager.instance();

    jetLogger.info("initializing seeding: checking database for credentials");
    let credential = await database.credential.findFirst({ where: { email: process.env.COMPANY_EMAIL!, name: process.env.NAME, surname: process.env.SURNAME } });
    if(!credential){
        credential = await database.credential.create({ data: { id: uuid(), email: process.env.COMPANY_EMAIL!, name: process.env.NAME!, surname: process.env.SURNAME!, password: process.env.COMPANY_PASSWORD!, role: "Admin" } });
    }

    jetLogger.info(JSON.stringify(credential));

    let project = await database.project.upsert({ 
        where: { name_ownerID: { name: process.env.PROJECT_NAME!, ownerID: credential.id } },
        update: {},
        create: { name: process.env.PROJECT_NAME!, ownerID: credential.id }
    });

    let organization = await database.organization.upsert({ 
        where: { name_projectID: { name: process.env.COMPANY_NAME!, projectID: project.id } },
        update: {},
        create:  { name: process.env.COMPANY_NAME!, projectID: project.id }
    });
    
    await database.client.upsert({
        where: { credentialID: credential.id }, update: {}, create: { credentialID: credential.id, organizationID: organization.id, projectID: project.id } 
    });

    let accessKey = await database.accessKey.findFirst({ where:{ projectID: project?.id } });
    if(!accessKey){
        accessKey = await database.accessKey.create({ data: { id: uuid(), projectID: project.id, name: "default", key: uuid(), enabled: true } });
    }

    SeedResult.set({ projectID: project.id, organizationID: organization.id });
    
    jetLogger.info(`${process.env.PROJECT_NAME} all set Project ID: ${project.id} - Access Key: ${accessKey.key}`);
}

export { DBManager };