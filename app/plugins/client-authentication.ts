import jetLogger from "jet-logger";
import Elysia from "elysia";
import {Client} from "@simplechat/shared/models";
import JWTPlugin from "./jwt-plugin";

const ClientAuthenicationPlugin = new Elysia().use(JWTPlugin).derive({ as: "scoped" }, async ({ decrypt, cookie: { client_token } })=>{
    let client: Client | undefined = undefined;

    if(client_token.value){
        try{
            client = await decrypt(client_token.value as string)
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

export default ClientAuthenicationPlugin;