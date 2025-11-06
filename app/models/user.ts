import { DBManager, SeedResult } from "../config";
import { User } from "@simplechat/shared/models";
import { Err } from "../config";

class UserModel{
    database = DBManager.instance();

    async create(data: { name: string, surname: string, email: string, username: string, password: string }): Promise<User>{
        try{
            let credential = await this.database.credential.findUnique({ where: { email: data.email } });
            if(credential){
                throw new Err(409, ``, "account with email already exists, try signing in");
            }

            credential = await this.database.credential.create({ data: { email: data.email, password: data.password } })
            let details = await this.database.details.create({ data: { id: credential.id, ...data } });
            
            const user = await this.database.user.create({ data: { id: details.id, adminID: SeedResult.instance().adminID } });
            return { ...user, details };
        }catch(error){
            throw new Err(503, error, "error encountered when creating user");
        }
    }

    async signin(data: { email: string, password: string }): Promise<User>{
        try{
            const credential = await this.database.credential.findUnique({ where: { email: data.email } });
            if(credential){
                if(data.password === credential.password){
                    return await this.database.user.findUniqueOrThrow({ 
                        where: { id: credential.id },
                        include: { details: true, admin: true }
                    });
                }
                throw new Err(401, ``, "incorrect password, check and try again");
            }
            throw new Err(401, ``, "account does not exists, try signing up");
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when getting user");
        }
    }

    async delete(user: User): Promise<string>{
        try{
            await this.database.user.delete({ where: { id: user.id } });
            await this.database.user.delete({ where: { id: user.id } });
            return "user was deleted successfully";
        }catch(error){
            throw new Err(503, error, "error encountered when deleting user");
        }
    }
}

export default UserModel;