import jetLogger from "jet-logger";
import { Elysia } from "elysia";

import JWTPlugin from "./jwt-plugin";
import { User } from "@simplechat/shared/models";

const PageAuthenicationPlugin =  new Elysia().use(JWTPlugin).derive({ as: "scoped" }, async ({ decrypt, cookie: { token } })=>{
    let user: User | undefined;

    if(token.value){
        try{
            user = await decrypt(token.value as string);
        }catch(error){
            jetLogger.err(error);
        }
    }
    return { user };
});

export default PageAuthenicationPlugin;