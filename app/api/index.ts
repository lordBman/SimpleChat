import chatRouter from "./chat";
import friendRouter from "./friends";
import jetLogger from "jet-logger";
import accessKeyRouter from "./access-keys";
import { AdminModel, ClientModel } from "../models";
import { Err } from "../config";
import { Friend, Group, Member, Details } from "@simplechat/shared/models";
import DeveloperModel from "../models/developer";
import projectRouter from "./projects";
import FriendModel from "../models/friends";
import GroupModel from "../models/groups";
import Elysia, { t } from "elysia";
import authRouter from "./auth";
import keyAuthenicationPlugin from "../plugins/key-authentication";
import UserAuthenicationPlugin from "../plugins/user-authentication";
import ClientAuthenicationPlugin from "../plugins/client-authentication";

let api = new Elysia({ prefix: "/api" })
.use(projectRouter.use(accessKeyRouter))
.use(chatRouter)
.use(friendRouter)
.use(authRouter);

api.use(new Elysia().use(UserAuthenicationPlugin.get("/", async({ user, cookie: { token }, status }) =>{
    try{
        let model: DeveloperModel | AdminModel = user?.role === "Admin" ? new AdminModel() : new DeveloperModel();
        const init = await model.get({ user: user! });

        return status(200, { ...init, token: token.value });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when getting user" });
        }
    }
})));

api.use(new Elysia().use(keyAuthenicationPlugin).use(ClientAuthenicationPlugin).get("/client", async({ project, organization, client, status, cookie: { token } }) =>{
    try{
        const init = await new ClientModel().get({ client, project, organization });
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
        const friendsResponse = await new FriendModel().find({ project, client, organization, query: params.query });
        const groupResponse = await new GroupModel().find({ project, client, organization, query: params.query });

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
}, { params: t.Object({ query: t.String() }) }));

api.all("*", ({ status })=>{
    return status(404, { message: "endpoint doesnot exists" });
});

export default api;