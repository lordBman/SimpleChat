import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import AccessKeyModel from "../models/access-keys";

const accessKeyRouter = express.Router();

accessKeyRouter.post("/", async(req, res) =>{
    if(req.body.name && req.body.projectID){
        const model = new AccessKeyModel();
        const response = await model.add(req.body);
        if(response){
            return res.status(HttpStatusCode.Created).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.patch("/", async(req, res) =>{
    if(req.body.key && req.body.name){
        const model = new AccessKeyModel();
        const response = await model.rename(req.body);
        if(response){
            return res.status(HttpStatusCode.Accepted).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.patch("/enable", async(req, res) =>{
    if(req.body.key){
        const model = new AccessKeyModel();
        const response = await model.activate(req.body);
        if(response){
            return res.status(HttpStatusCode.Accepted).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.patch("/disable", async(req, res) =>{
    if(req.body.key){
        const model = new AccessKeyModel();
        const response = await model.deactivate(req.body);
        if(response){
            return res.status(HttpStatusCode.Accepted).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.delete("/", async(req, res) =>{
    if(req.body.key){
        const model = new AccessKeyModel();
        const response = await model.delete(req.body);
        if(response){
            return res.status(HttpStatusCode.Ok).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

export default accessKeyRouter;