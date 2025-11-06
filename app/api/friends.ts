import FriendModel from "../models/friends";
import { Err } from "../config";
import jetLogger from "jet-logger";
import Elysia, { t } from "elysia";
import { ClientAuthenicationPlugin, connectedPlugin, keyAuthenicationPlugin } from "./plugins";
import { WSFriendOperation } from "@simplechat/shared";

const friendRouter = new Elysia({ prefix: "/friends" }).decorate({ "friendModel": new FriendModel() });

friendRouter.use(keyAuthenicationPlugin).use(ClientAuthenicationPlugin).use(connectedPlugin)
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
})

.ws("/ws", {
    body: t.Object({
        operation: t.String(),
        friendID: t.Optional(t.String()),
        userID: t.Optional(t.String()),
    }),
    open: async (ws) =>{
        console.log("socket connected on friends route");
        ws.data.add(ws.data.client!.id, ws);
    },
    close: (ws) =>{
        console.log("socket disconnected on friends route");
        ws.data.remove(ws.data.client!.id);
    },
    message: (ws, message)=>{
        switch(message.operation){
            case WSFriendOperation.Request:
                if(message.userID){
                    ws.data.friendModel.request({ userID: message.userID!, project: ws.data.project!, organization: ws.data.organization, client: ws.data.client! }).then((friend)=>{
                        ws.subscribe(friend.id);
                        if(ws.data.isOnline(message.userID!)){
                            ws.data.get(message.userID!).subscribe(friend.id);
                        }
                        ws.publish(friend.id, { operation: message.operation, friend });
                    }).catch((error)=>{
                        jetLogger.err(error);
                        if(error instanceof Err){
                            const err = error as Err;
                            ws.send({ operation: message.operation, message: err.message, status: err.code });
                        }else{
                            ws.send({ operation: message.operation, message: "an internal server error occurred when create friend request", status: 503 });
                        }
                    });
                }else{
                    ws.send({ operation: message.operation, message: "invalid socket request", status: 400 });
                }
                break;
            case WSFriendOperation.Cancel:
                if(message.friendID){
                    ws.data.friendModel.cancel({ id: message.friendID!, client: ws.data.client! }).then((friend)=>{
                        ws.publish(friend.id, { operation: message.operation, friend });
                    }).catch((error)=>{
                        jetLogger.err(error);
                        if(error instanceof Err){
                            const err = error as Err;
                            ws.send({ operation: message.operation, message: err.message, status: err.code });
                        }else{
                            ws.send({ operation: message.operation, message: "an internal server error occurred when canceling friend request", status: 503 });
                        }
                    });
                }else{
                    ws.send({ operation: message.operation, message: "invalid socket request", status: 400 });
                }
                break;
            case WSFriendOperation.Approve:
                if(message.friendID){
                    ws.data.friendModel.accept({ id: message.friendID!, client: ws.data.client! }).then((friend)=>{
                        ws.publish(friend.id, { operation: message.operation, friend });
                    }).catch((error)=>{
                        jetLogger.err(error);
                        if(error instanceof Err){
                            const err = error as Err;
                            ws.send({ operation: message.operation, message: err.message, status: err.code });
                        }else{
                            ws.send({ operation: message.operation, message: "an internal server error occurred when accepting friend request", status: 503 });
                        }
                    });
                }else{
                    ws.send({ operation: message.operation, message: "invalid socket request", status: 400 });
                }
                break;
            case WSFriendOperation.Reject:
                if(message.friendID){
                    ws.data.friendModel.cancel({ id: message.friendID!, client: ws.data.client! }).then((friend)=>{
                        ws.publish(friend.id, { operation: message.operation, friend });
                    }).catch((error)=>{
                        jetLogger.err(error);
                        if(error instanceof Err){
                            const err = error as Err;
                            ws.send({ operation: message.operation, message: err.message, status: err.code });
                        }else{
                            ws.send({ operation: message.operation, message: "an internal server error occurred when rejecting friend request", status: 503 });
                        }
                    });
                }else{
                    ws.send({ operation: message.operation, message: "invalid socket request", status: 400 });
                }
                break;
        }
    }
});

export default friendRouter;