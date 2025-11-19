import { Err } from "../config"
import jetLogger from "jet-logger";
import { t, Elysia } from "elysia";
import { AccessKeyModel } from "../models";
import UserAuthenicationPlugin from "../plugins/user-authentication";

const accessKeyRouter = new Elysia({ prefix: "/access-keys" });

accessKeyRouter.use(UserAuthenicationPlugin).decorate({ "accessKeyModel": new AccessKeyModel(), })
.post("/", async({ body, accessKeyModel, status }) =>{
    try{
        const response = await accessKeyModel.add({ name: body.name, projectID: body.projectID });
        
        return status(201, response);
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when creating access key" });
        }
    }
}, { body: t.Object({ name: t.String(), projectID: t.String() }) })

.patch("/", async({ body, accessKeyModel, status }) =>{
    try{
        const response = await accessKeyModel.rename({ accessID: body.accessID, name: body.name });

        return status(202, { message: response });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when renaming access key" });
        }
    }
}, { body: t.Object({ accessID: t.String(), name: t.String() }) })

.patch("/enable", async({ body, accessKeyModel, status }) =>{
    try{
        const response = await accessKeyModel.activate({ accessID: body.accessID });
        return status(202, { message: response });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when enabling access key" });
        }
    }
}, { body: t.Object({ accessID: t.String() }) })

.patch("/disable", async({ body, accessKeyModel, status }) =>{
    try{
        const response = await accessKeyModel.deactivate({ accessID: body.accessID });

        return status(202, { message: response });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when disabling access key" });
        }
    }
}, { body: t.Object({ accessID: t.String() }) })

.delete("/", async({ body, accessKeyModel, status }) =>{
    try{
        const response = await accessKeyModel.delete({ accessKeyID: body.accessKeyID });
        return status(200, { message: response });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when deleting access key" });
        }
    }
}, { body: t.Object({ accessKeyID: t.String() }) });

export default accessKeyRouter;