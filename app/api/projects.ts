import Elysia, { t } from "elysia";
import { Err } from "../config";
import ProjectModel from "../models/projects";
import jetLogger from "jet-logger";
import APIAuthenicationPlugin from "../plugins/api-authentication";

const projectRouter = new Elysia({ prefix: "/projects" }).decorate({ "projectModel": new ProjectModel() });

projectRouter.use(APIAuthenicationPlugin)
.post("/", async({ body, projectModel, user, status }) =>{
    try{
        const response = await projectModel.create({ ...body, user: user! });
        return status(201, response);
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when creating project" });
        }
    }
}, { body: t.Object({ name: t.String(), description: t.Optional(t.String()) }) })

.get("/:id?", async({ body, params, user, projectModel, status }) =>{
    try{
        if(body.id ?? params.id){
            const response = await projectModel.get({ user: user!, projectID: body.id ?? params.id! });
            return status(200, response);
        }
        const response = await projectModel.all({ user: user! }); 
        return status(200, response);
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when getting all projects" });
        }
    }
}, { params: t.Object({ id: t.Optional(t.String()) }), body: t.Object({ id: t.Optional(t.String()) }) });

export default projectRouter;