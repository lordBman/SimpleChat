import chatRouter from "./chat";
import friendRouter from "./friends";
import jetLogger from "jet-logger";
import accessKeyRouter from "./access-keys";
import { AdminModel } from "../models";
import { Err } from "../config";
import { User, Friend, Group, Member } from "@simplechat/shared";
import DeveloperModel from "../models/developer";
import projectRouter from "./projects";
import FriendModel from "../models/friends";
import GroupModel from "../models/groups";
import Elysia, { t } from "elysia";
import authRouter from "./auth";
import { developerAuthenicationPlugin, keyAuthenicationPlugin } from "./plugins";

const api = new Elysia({ prefix: "/api" });
api.use(projectRouter.use(accessKeyRouter));
api.use(chatRouter);
api.use(friendRouter);

api.use(api.use(authRouter)).decorate({ "adminModel": new AdminModel() }).use(keyAuthenicationPlugin).use(developerAuthenicationPlugin)
.get("/", async({ project, credential, organization, developerModel, adminModel, cookie: { token }, status }) =>{
    try{
        if(!credential?.role || credential.role === "Client"){
            return status(401, { message: "only admins and developers are authorized" });
        }else{
            let model: DeveloperModel | AdminModel = credential.role === "Admin" ? adminModel : developerModel;
            
            const init = await model.get({ credential: credential!, project: project!, organization });

            return status(200, { ...init, token: token.value });
        }
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

.get("/client", async({ project, clientModel, organization, credential, status, cookie: { token } }) =>{
    try{
        const init = await clientModel.get({ credential: credential!, project: project!, organization });
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

.get("/search:query", async({ organization, params, credential, project, status })=>{
    try{
        const friendsResponse = await new FriendModel().find({ project: project!, credential: credential!, organization, query: params.query });
        const groupResponse = await new GroupModel().find({ project: project!, credential: credential!, organization, query: params.query });

        const getName = (result: { user: Credential, friend?: Friend } | { group: Group, member?: Member }):string =>{
            if('user' in result){
                const init = result as { user: Credential, friend?: Friend };
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