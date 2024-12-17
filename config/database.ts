import { PrismaClient } from '@prisma/client'

export default class Database{
    client: PrismaClient = new PrismaClient();

    connect(): Promise<PrismaClient> {
        return new Promise<PrismaClient>((resolve, reject)=>{
            this.client.$connect().catch((error)=>{
                if(error){
                    reject(error);
                }
                resolve(this.client);
            })
        });
    }
}