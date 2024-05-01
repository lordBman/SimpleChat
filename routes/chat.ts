import express from "express";
import { HttpStatusCode } from "axios";
import { ChatModel } from "../models";
import { DBManager } from "../config";

const chatRouter = express.Router();

chatRouter.post("/", async(req, res) =>{
    if(req.body.message && ( req.body.friendID || req.body.groupID )){
        const model = new ChatModel();
        const init = await model.create(req.body);

        if(init){
            return res.status(HttpStatusCode.Created).send(init);
        }
        return DBManager.instance().errorHandler.display(res);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

chatRouter.put("/", async(req, res) =>{
    if(req.body.message && req.body.chatID && ( req.body.friendID || req.body.groupID ) ){
        const model = new ChatModel();
        const init = await model.update(req.body);

        if(init){
            return res.status(HttpStatusCode.Accepted).send(init);
        }
        return DBManager.instance().errorHandler.display(res);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default chatRouter;