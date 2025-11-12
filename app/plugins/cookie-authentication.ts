import jetLogger from "jet-logger";
import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import {Client} from "@simplechat/shared/models";

const CookieAuthenicationPlugin = new Elysia().use( jwt({ name: 'jwt', secret: process.env.SECRET || 'test'})).derive({ as: "global" }, async ({ jwt, cookie: { client_token } })=>{
    let client: Client | undefined = undefined;

    if(client_token.value){
        try{
            const payload: any = await jwt.verify(client_token?.value as string);
            if (payload){
                client = JSON.parse(payload.client);
            }
        }catch(error){
            jetLogger.err(error);
        }
    }
    return { client };
}).onBeforeHandle(async ({ status, client })=>{
    if(!client){
        return status(401, {message: "access token expired, try refreshing or login again"});
    }
});

export default CookieAuthenicationPlugin;