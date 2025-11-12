import jetLogger from "jet-logger";
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import {User} from "@simplechat/shared";

const APIAuthenicationPlugin =  new Elysia().use( jwt({ name: 'jwt', secret: process.env.SECRET || 'test'})).derive({ as: "global" }, async ({ jwt, status, cookie: { token } })=>{
    let user: User | undefined
    if(token.value){
        try{
            const payload: any = await jwt.verify(token?.value as string);
            if (payload){
                user = JSON.parse(payload.user);
            }
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