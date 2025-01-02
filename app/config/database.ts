import { Pool } from "pg";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export default class Database{
    client: PrismaClient;

    connect(): Promise<PrismaClient> {
        return new Promise<PrismaClient>((resolve, reject)=>{
            
            /*const connectionString = `${process.env.DATABASE_URL}`;
            const pool = new Pool({ connectionString });
            const adapter = new PrismaPg(pool);*/
            this.client = new PrismaClient({ log: [{ level: 'query', emit: 'event' }], });
            
            this.client.$connect().catch((error)=>{
                if(error){
                    reject(error);
                }
                resolve(this.client);
            })
        });
    }
}