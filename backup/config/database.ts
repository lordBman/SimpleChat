import { PrismaClient } from '@prisma/client'
import ErrorHandler from './error';

export default class Database{
    errorHandler: ErrorHandler;
    client: PrismaClient = new PrismaClient();

    constructor(error: ErrorHandler){
        this.errorHandler = error;
    }

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