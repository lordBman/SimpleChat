import jetLogger from "jet-logger";
import Elysia from "elysia";
import {Client} from "@simplechat/shared/models";
import JWTPlugin from "./jwt-plugin";
import { ClientModel } from "../models";

const ClientAuthenicationPlugin = new Elysia().use(JWTPlugin).derive({ as: "scoped" }, async ({ decrypt, status, cookie: { client_token } })=>{
    if(client_token.value){
        try{
            const client: Client = await decrypt(client_token.value as string);
            if(!client){
                return status(401, {message: "access token expired, try refreshing or login again"});
            }
            const clientModel = new ClientModel();
            const project = await clientModel.project(client);
            const organization = await clientModel.organization(client);

            return { client, project, organization };
        }catch(error){
            jetLogger.err(error);
        }
    }
    return status(401, {message: "access token expired, try refreshing or login again"});
});

export default ClientAuthenicationPlugin;