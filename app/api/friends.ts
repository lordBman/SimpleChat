import FriendModel from "../models/friends";
import { Err } from "../config";
import jetLogger from "jet-logger";
import Elysia, { t } from "elysia";
import keyAuthenicationPlugin from "../plugins/key-authentication";
import clientAuthenicationPlugin from "../plugins/client";

const friendRouter = new Elysia({ prefix: "/friends" }).decorate({ "friendModel": new FriendModel() });

friendRouter.use(keyAuthenicationPlugin).use(clientAuthenicationPlugin)
.get("/search", async({ status, query, client, friendModel, project, organization })=>{
    try{
        const response = await friendModel.find({ query: query.query, project: project!, organization, client: client! });
        return status(200, response);
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred while searching for users" });
        }
    }
}, { query: t.Object({ query: t.String() }) })

.post("/cancel", async({ body, client, friendModel, status })=>{
    try{
        const response = await friendModel.reject({ ...body, client: client! });
        
        return status(200, { message: response });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred while canceling friend request" });
        }
    }
}, { body: t.Object({ id: t.String() }) })

.patch("/accept", async({ body, query, status, client, friendModel })=>{
    if(body.id ?? query.id){
        try{
            const response = await friendModel.accept({ client: client!,  id: body.id ?? query.id! });
            
            return status(200, response );
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred while accepting friend request" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { body: t.Object({ id: t.Optional(t.String()) }), query: t.Object({ id: t.Optional(t.String()) }) })

.patch("/reject", async({ body, query, friendModel, client, status })=>{
    if(body.id ?? query.id){
        try{
            const response = await friendModel.reject({ id: body.id ?? query.id, client: client! });
            
            return status(200, response );
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                
                status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred while rejecting friend request" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { body: t.Object({ id: t.Optional(t.String()) }) })

.post("/", async({ body, status, friendModel, project, organization, client })=>{
    try{
        const response = await friendModel.request({ ...body, project: project!, organization, client: client! });
        return status(200, response);
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred while sending friend request" });
        }
    }
}, { body: t.Object({ userID: t.String() }) })

.get("/", async({ friendModel, project, client, organization, status })=>{
    try{
        const response = await friendModel.all({ project: project!, organization, client: client! });

        return status(200, response);
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred while getting list of friends" });
        }
    }
});

export default friendRouter;