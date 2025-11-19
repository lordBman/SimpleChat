import jetLogger from "jet-logger";
import { Elysia } from "elysia";

import JWTPlugin from "./jwt-plugin";
import { User } from "@simplechat/shared/models";

const UserAuthenicationPlugin =  new Elysia().use(JWTPlugin).derive({ as: "scoped" }, async ({ status, decrypt, cookie: { token } })=>{
    let user: User | undefined

    if(token.value){
        try{
            console.log("cookie founds:", token.value);
            user = await decrypt(token.value as string);
        }catch(error){
            jetLogger.err(error);
            return status(401, {message: "invalid access token, try refreshing or login again"});
        }
    }
    return { user };
}).onBeforeHandle(async ({ status, user })=>{
    jetLogger.info("I entered unauthorized");
    jetLogger.info(user);
    if(!user){  
        return status(401, {message: "access token expired, try refreshing or login again"});
    }
});

export default UserAuthenicationPlugin;