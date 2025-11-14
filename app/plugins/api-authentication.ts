import jetLogger from "jet-logger";
import { Elysia } from "elysia";

import JWTPlugin from "./jwt-plugin";
import { User } from "@simplechat/shared/models";

const APIAuthenicationPlugin =  new Elysia().use(JWTPlugin).derive({ as: "global" }, async ({ status, decrypt, cookie: { token } })=>{
    let user: User | undefined

    if(token.value){
        try{
            user = await decrypt(token.value as string);
        }catch(error){
            jetLogger.err(error);
            return status(401, {message: "access token expired, try refreshing or login again"});
        }
    }
    return { user };
}).onBeforeHandle(async ({ status, user })=>{
    if(!user){
        return status(401, {message: "access token expired, try refreshing or login again"});
    }
});

export default APIAuthenicationPlugin;