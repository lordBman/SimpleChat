import express, { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { Err } from "../config";
import AccessKeyModel from "../models/access-keys";
import jetLogger from "jet-logger";

const accessKeyRouter = express.Router();

accessKeyRouter.post("/", async(req , res) =>{
    if(req.body.name && req.body.projectID){
        try{
            const model = new AccessKeyModel();
            const response = await model.add(req.body);
            
            res.status(HttpStatusCode.Created).send(response);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                res.status(err.code).send({ message: err.message });
            }else{
                res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when creating access key" });
            }
        }
    }else{
        res.status(HttpStatusCode.BadRequest).send("invalid request to server");
    }
});

accessKeyRouter.patch("/", async(req, res) =>{
    if(req.body.accessID && req.body.name){
        try{
            const model = new AccessKeyModel();
            const response = await model.rename(req.body);

            res.status(HttpStatusCode.Accepted).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                res.status(err.code).send({ message: err.message });
            }else{
                res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when renaming access key" });
            }
        }
    }else{
        res.status(HttpStatusCode.BadRequest).send("invalid request to server");
    }
});

accessKeyRouter.patch("/enable", async(req, res) =>{
    if(req.body.accessID){
        try{
            const model = new AccessKeyModel();
            const response = await model.activate(req.body);
            
            res.status(HttpStatusCode.Accepted).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                res.status(err.code).send({ message: err.message });
            }else{
                res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when enabling access key" });
            }
        }
    }else{
        res.status(HttpStatusCode.BadRequest).send("invalid request to server");
    }
});

accessKeyRouter.patch("/disable", async(req, res) =>{
    if(req.body.accessID){
        try{
            const model = new AccessKeyModel();
            const response = await model.deactivate(req.body);

            res.status(HttpStatusCode.Accepted).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                res.status(err.code).send({ message: err.message });
            }else{
                res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when disabling access key" });
            }
        }
    }else{
        res.status(HttpStatusCode.BadRequest).send("invalid request to server");
    }
});

accessKeyRouter.delete("/", async(req, res) =>{
    if(req.body.accessID){
        try{
            const model = new AccessKeyModel();
            const response = await model.delete(req.body);
            
            res.status(HttpStatusCode.Ok).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                res.status(err.code).send({ message: err.message });
            }else{
                res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when deleting access key" });
            }
        }
    }else{
        res.status(HttpStatusCode.BadRequest).send("invalid request to server");
    }
});

export default accessKeyRouter;