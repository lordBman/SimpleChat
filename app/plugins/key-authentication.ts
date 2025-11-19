import Elysia from "elysia";
import {AccessKeyModel, OrganizationModel} from "../models";
import ProjectModel from "../models/projects";
import { AccessHeaderKeys, AccessQueryKeys} from "@simplechat/shared";
import {Err} from "../config";
import jetLogger from "jet-logger";
import { AccessKey, Project } from "@simplechat/shared/models";
import Organization from "@simplechat/shared/models/organization";

const keyAuthenicationPlugin = new Elysia().decorate({ "accessKeyModel": new AccessKeyModel(), "projectModel": new ProjectModel(), "organizationModel": new OrganizationModel() }).derive({ as: "scoped" }, async ({ headers, query, status, accessKeyModel, projectModel, organizationModel })=>{
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
            if(accesskey?.enabled && project && organizationName){
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

export default keyAuthenicationPlugin;