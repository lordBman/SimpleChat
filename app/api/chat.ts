import { ChatModel, GroupModel } from "../models";
import { Err } from "../config";
import jetLogger from "jet-logger";
import Elysia, { t } from "elysia";
import keyAuthenicationPlugin from "../plugins/key-authentication";
import clientAuthenicationPlugin from "../plugins/client";

const chatRouter = new Elysia({ prefix: "/chat" }).decorate({ "chatModel": new ChatModel() });

chatRouter.use(keyAuthenicationPlugin).use(clientAuthenicationPlugin)
.get("/:ownerID/:id?", async({ params, body, chatModel, client, status }) =>{
    if(params.ownerID || body.groupID || body.friendID){
        try{
            if(body.id ?? params.id){
                const response = await chatModel.get({ client: client!, chatID: body.id ?? params.id!, friendID: params.ownerID || body.friendID!, groupID: params.ownerID || body.groupID! });
                return status(200, response);
            }else{
                const response = await chatModel.all({ client: client!, friendID: params.ownerID || body.friendID, groupID: params.ownerID || body.groupID }); 
                return status(200, response);
            }
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred when getting chats" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { params: t.Object({ id: t.Optional(t.String()), ownerID: t.Optional(t.String()) }), body: t.Object({ id: t.Optional(t.String()), groupID: t.Optional(t.String()), friendID: t.Optional(t.String()) }) })

.post("/", async({ chatModel, client, body, status, store }) =>{
    if(body.friendID || body.groupID ){
        try{
            const init = await chatModel.create({ ...body, client: client! });

            //store.connectedSockets[client!.id]?.publish(init.ownerID, { operation: WSChatOperation.SendMessage, chat: init });
            return status(201, init);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred when processing message" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { body: t.Object({ message: t.String(), friendID: t.Optional(t.String()), groupID: t.Optional(t.String()) }) })

.patch("/", async({ body, chatModel, client, status, store }) =>{
    if(body.friendID || body.groupID){
        try{
            const init = await chatModel.update({ ...body, client: client! });
            //store.connectedSockets[client!.id]?.publish(init.ownerID, { operation: WSChatOperation.EditMessage, chat: init });
            return status(201, init);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred when updating message" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { body: t.Object({ chatID: t.String(), message: t.String(), friendID: t.Optional(t.String()), groupID: t.Optional(t.String()) }) });

export default chatRouter;