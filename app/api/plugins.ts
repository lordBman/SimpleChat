import { AccessKey, Organization, Project, AccessHeaderKeys, AccessQueryKeys, User } from "@simplechat/shared";
import Elysia from "elysia";
import { AccessKeyModel, OrganizationModel } from "../models";
import jetLogger from "jet-logger";
import { Err } from "../config";
import jwt from "@elysiajs/jwt";
import ProjectModel from "../models/projects";
import { Client } from "@simplechat/shared/models";

export const keyAuthenicationPlugin = new Elysia().decorate({ "accessKeyModel": new AccessKeyModel(), "projectModel": new ProjectModel(), "organizationModel": new OrganizationModel() }).derive({ as: "global" }, async ({ headers, query, status, accessKeyModel, projectModel, organizationModel })=>{
    let accesskey: AccessKey | undefined = undefined;
    let project: Project | undefined = undefined;
    let organization: Organization | undefined = undefined;

    const organizationName = headers[AccessHeaderKeys.Organization] ?? query[AccessQueryKeys.Organization];
    const key = headers[AccessHeaderKeys.AccessKey] ?? query[AccessQueryKeys.AccessKey];
    const projectToken = headers[AccessHeaderKeys.ProjectToken] ?? query[AccessQueryKeys.ProjectToken];
    if(key && projectToken){
        try {
            accesskey = await accessKeyModel.get(key);
            project = await projectModel.getByToken(projectToken);
            if(accesskey.enabled && project && organizationName){            
                organization = await organizationModel.get({ project, name: organizationName });
            }
        }catch (error) {
            jetLogger.err(error);
            if(error instanceof Err){
                const init = error as Err;

                return status(init.code, { message: init.message });
            }else{
                return status(503, {message: "error encountered when authenticating acess key"});
            }
        }
    }
    return { accesskey, project, organization };
}).onBeforeHandle(async ({ status, accesskey, project })=>{
    if(!accesskey){
        return status(401, {message: "API Access key not found" });
    }

    if(!project){
        return status(401, {message: "Project not found for provided project token" });
    }

    if(!accesskey.enabled){
        return status(401, {message: "API Access key found but has been deactivated" });
    }

    if(accesskey.projectID !== project.id){
        return status(401, {message: "access key does not belong to the provided project" });
    }
});

export const APIAuthenicationPlugin = new Elysia().use( jwt({ name: 'jwt', secret: process.env.SECRET || 'test'})).derive({ as: "global" }, async ({ jwt, cookie: { token } })=>{
    let user: User | undefined
    if(token.value){
        try{
            const payload: any = await jwt.verify(token?.value as string);
            if (payload){
                user = JSON.parse(payload.user);
            }
        }catch(error){
            jetLogger.err(error);
        }
    }
    return { user };
}).onBeforeHandle(async ({ status, user })=>{
    if(!user){
        return status(401, {message: "access token expired, try refreshing or login again"});
    }
});

export const CookieAuthenicationPlugin = new Elysia().use( jwt({ name: 'jwt', secret: process.env.SECRET || 'test'})).derive({ as: "global" }, async ({ jwt, cookie: { client_token } })=>{
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

export const ClientAuthenicationPlugin = new Elysia().use(keyAuthenicationPlugin).use(CookieAuthenicationPlugin);

export const adminAuthenicationPlugin = new Elysia().use(APIAuthenicationPlugin).onBeforeHandle(async ({ status, user })=>{
    if(!user || user.role !== "Admin"){
        return status(401, {message: "You don't have permission to access this route" });
    }
});