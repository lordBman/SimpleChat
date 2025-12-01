import jetLogger from "jet-logger";
import { Elysia } from "elysia";
import JWTPlugin from "./jwt-plugin";
import { User } from "@simplechat/shared/models";

const UserAuthenicationPlugin =  new Elysia().use(JWTPlugin).derive({ as: "scoped" }, async ({ status, decrypt, cookie: { token } })=>{
    if(token.value){
        try{
            const user: User = await decrypt(token.value as string);
            if(!user){  
                return status(401, {message: "access token expired, try refreshing or login again"});
            }
            return { user };
        }catch(error){
            jetLogger.err(error);
        }
    }
    return status(401, {message: "invalid access token, try refreshing or login again"});
});

export default UserAuthenicationPlugin;