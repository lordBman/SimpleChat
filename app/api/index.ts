import chatRouter from "./chat";
import friendRouter from "./friends";
import jetLogger from "jet-logger";
import accessKeyRouter from "./access-keys";
import { AdminModel, ClienitModel } from "../models";
import { Err } from "../config";
import { Friend, Group, Member, Details } from "@simplechat/shared/models";
import DeveloperModel from "../models/developer";
import projectRouter from "./projects";
import FriendModel from "../models/friends";
import GroupModel from "../models/groups";
import Elysia, { t } from "elysia";
import authRouter from "./auth";
import APIAuthenicationPlugin from "../plugins/api-authentication";
import clientAuthenicationPlugin from "../plugins/client";

let api = new Elysia({ prefix: "/api" }).decorate({ "adminModel": new AdminModel(), "developerModel": new DeveloperModel(), "clientModel": new ClienitModel() });
api.use(projectRouter.use(accessKeyRouter));
api.use(chatRouter);
api.use(friendRouter);

api.use(api.use(authRouter));
api.use(APIAuthenicationPlugin).get("/", async({ user, developerModel, adminModel, cookie: { token }, status }) =>{
    try{
        let model: DeveloperModel | AdminModel = user?.role === "Admin" ? adminModel : developerModel;
        const init = await model.get({ user: user! });

        return status(200, { ...init, token: token.value });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when creating user" });
        }
    }
});

api.use(clientAuthenicationPlugin).get("/client", async({ project, clientModel, organization, client, status, cookie: { token } }) =>{
    try{
        const init = await clientModel.get({ client: client!, project: project!, organization });
        return status(200, { ...init, token: token.value });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when creating user" });
        }
    }
})

.get("/search:query", async({ organization, params, client, project, status })=>{
    try{
        const friendsResponse = await new FriendModel().find({ project: project!, client: client!, organization, query: params.query });
        const groupResponse = await new GroupModel().find({ project: project!, client: client!, organization, query: params.query });

        const getName = (result: { user: Details, friend?: Friend } | { group: Group, member?: Member }):string =>{
            if('user' in result){
                const init = result as { user: Details, friend?: Friend };
                return init.user.name;
            }else{
                const init = result as { group: Group, member?: Member };
                return init.group.name;
            }
        }

        const response = [...friendsResponse, ...groupResponse].sort((a,b)=>{
            const aName = getName(a);
            const bName = getName(b);
            return aName.localeCompare(bName);
        });
        
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
}, { params: t.Object({ query: t.String() }) });

export default api;