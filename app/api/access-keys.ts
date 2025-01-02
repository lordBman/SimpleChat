import express from "express";
import { HttpStatusCode } from "axios";
import { Err } from "../config";
import AccessKeyModel from "../models/access-keys";
import jetLogger from "jet-logger";

const accessKeyRouter = express.Router();

accessKeyRouter.post("/", async(req, res) =>{
    if(req.body.name && req.body.projectID){
        try{
            const model = new AccessKeyModel();
            const response = await model.add(req.body);
            
            return res.status(HttpStatusCode.Created).send(response);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when creating access key" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.patch("/", async(req, res) =>{
    if(req.body.accessID && req.body.name){
        try{
            const model = new AccessKeyModel();
            const response = await model.rename(req.body);

            return res.status(HttpStatusCode.Accepted).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when renaming access key" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.patch("/enable", async(req, res) =>{
    if(req.body.accessID){
        try{
            const model = new AccessKeyModel();
            const response = await model.activate(req.body);
            
            return res.status(HttpStatusCode.Accepted).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when enabling access key" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.patch("/disable", async(req, res) =>{
    if(req.body.accessID){
        try{
            const model = new AccessKeyModel();
            const response = await model.deactivate(req.body);

            return res.status(HttpStatusCode.Accepted).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when disabling access key" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

accessKeyRouter.delete("/", async(req, res) =>{
    if(req.body.accessID){
        try{
            const model = new AccessKeyModel();
            const response = await model.delete(req.body);
            
            return res.status(HttpStatusCode.Ok).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when deleting access key" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send("invalid request to server");
});

export default accessKeyRouter;