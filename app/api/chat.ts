import express from "express";
import { HttpStatusCode } from "axios";
import { ChatModel } from "../models";
import { Err } from "../config";
import jetLogger from "jet-logger";

const chatRouter = express.Router();

chatRouter.post("/", async(req, res) =>{
    if(req.body.message && ( req.body.friendID || req.body.groupID )){
        try{
            const model = new ChatModel();
            const init = await model.create(req.body);
            
            return res.status(HttpStatusCode.Created).send(init);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when processing message" });
        }
        
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

chatRouter.put("/", async(req, res) =>{
    if(req.body.message && req.body.chatID && ( req.body.friendID || req.body.groupID ) ){
        try{
            const model = new ChatModel();
            const init = await model.update(req.body);
            
            return res.status(HttpStatusCode.Accepted).send(init);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when updating message" });
        }
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default chatRouter;