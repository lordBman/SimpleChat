import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt from "jsonwebtoken";
import { Channel, User } from "@prisma/client";
import { uuid } from "../utils";

class UserModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    private async create(data: { name: string, password: string }): Promise<string | undefined>{
        try{
            const id = uuid();
            const init = await this.database.client.user.create({ data: { id, ...data } });

            const token = jwt.sign({ user: init }, process.env.SECRET || "test", { expiresIn: "7 days" } );

            return token;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async signin(data: { name: string, password: string }): Promise<string | undefined>{
        try{
            const init = await this.database.client.user.findFirst({ where: { name: data.name } });
            if(init){
                if(data.password === init.password){
                    console.log(JSON.stringify(data.password));
                    const token = jwt.sign({ user: init }, process.env.SECRET || "test", { expiresIn: "7 days" } );
                    return token;
                }
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "incorrect password, check and try again");
            }
            return this.create(data);
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting user");
        }
    }

    async delete(data: { token: string }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.SECRET || "test" ) as  any;
            await this.database.client.user.delete({ where: { id: user.id } });

            return "user was deleted successfully";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }

    async get(data: { token: string }): Promise<User & { channels: Channel[] } & { firends: User[] }| undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.SECRET || "test" ) as any;

            const init = await this.database.client.user.findUnique({
                where:{ id: user.id },
                include: { notifications: { orderBy: { created: "desc" } } }
            });

            const channels = await this.database.client.channel.findMany({ 
                where: { OR: [ { userOneID: user.id, }, { userTwoID: user.id } ] },
                include: { chats: { orderBy: { created:  "desc" } } },
            });

            const firends = await this.database.client.user.findMany({
                where: { NOT:{ id: user.id } }
            });

            return { ...init!, channels, firends };
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }
}

export default UserModel;