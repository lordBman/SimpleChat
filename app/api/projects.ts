import Elysia, { t } from "elysia";
import { Err } from "../config";
import ProjectModel from "../models/projects";
import jetLogger from "jet-logger";
import UserAuthenicationPlugin from "../plugins/user-authentication";

const projectRouter = new Elysia({ prefix: "/projects" }).decorate({ "projectModel": new ProjectModel() });

projectRouter.use(UserAuthenicationPlugin)
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

.get("/:id?", async({ params, user, projectModel, status }) =>{
    try{
        if(params.id){
            const response = await projectModel.get({ user: user!, projectID: params.id! });
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
});

export default projectRouter;