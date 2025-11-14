import { uuid } from "./utils";
import jetLogger from "jet-logger";
import { PrismaClient } from "@prisma/client";
import { Credential } from "@prisma/client";

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
    code : number;
    error: any; 

    constructor(code : number, error: any, message: string){
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
    adminID: string
} 

export class SeedResult{
    static seed?: Seed;

    private constructor(){}
    
    static set = (result: { adminID: string, projectID: string, organizationID: string }) =>SeedResult.seed = result;


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

    jetLogger.info("initializing seeding: checking database for admin user");
    
    let user = await database.user.findFirst({ where: { role: "Admin" } });
    let credential = user ? (await database.credential.upsert({
        where: { id: user.id },
        update: { email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! },
        create: { email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! }
    })) : (await database.credential.upsert({
        where: { email: process.env.COMPANY_EMAIL! },
        update: { email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! },
        create: { email: process.env.COMPANY_EMAIL!, password: process.env.COMPANY_PASSWORD! }
    }));

    let details = await database.details.upsert({ 
        where: { id: credential.id },
        create: { id: credential.id, name: process.env.NAME!, surname: process.env.SURNAME!, email: process.env.COMPANY_EMAIL!, username: process.env.ADMIN_USERNAME! },
        update: { name: process.env.NAME, surname: process.env.SURNAME, email: process.env.COMPANY_EMAIL!, username: process.env.ADMIN_USERNAME! }
    });

    user = await database.user.upsert({
        where: { id: credential.id }, 
        create: { id: credential.id, role: "Admin" },
        update: {}
    });

    jetLogger.info(JSON.stringify(details));

    jetLogger.info("initializing seeding: checking database for admin default project");
    let project = await database.project.upsert({ 
        where: { name_ownerID: { name: process.env.PROJECT_NAME!, ownerID: credential.id } },
        update: {},
        create: { name: process.env.PROJECT_NAME!, ownerID: credential.id }
    });

    jetLogger.info("initializing seeding: checking database for company organization");
    let organization = await database.organization.upsert({ 
        where: { name_projectID: { name: process.env.COMPANY_NAME!, projectID: project.id } },
        update: {},
        create:  { name: process.env.COMPANY_NAME!, projectID: project.id }
    });
    
    jetLogger.info("initializing seeding: initializing admin client account");
    await database.client.upsert({
        where: { id: credential.id }, update: {}, create: { id: credential.id, organizationID: organization.id, projectID: project.id } 
    });

    jetLogger.info("initializing seeding: initializing Project default Access Key");
    let accessKey = await database.accessKey.findFirst({ where:{ projectID: project?.id, name: "default" } });
    if(!accessKey){
        accessKey = await database.accessKey.create({ data: { id: uuid(), projectID: project.id, name: "default", key: uuid(), enabled: true } });
    }

    SeedResult.set({ projectID: project.id, organizationID: organization.id, adminID: credential.id });
    
    jetLogger.info(`${process.env.PROJECT_NAME} all set Project ID: ${project.id} - Access Key: ${accessKey.key}`);
}

export { DBManager };