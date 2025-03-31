import express from "express";
import { HttpStatusCode } from "axios";
import { Err } from "../config";
import ProjectModel from "../models/projects";
import jetLogger from "jet-logger";

const projectRouter = express.Router();

projectRouter.post("/", async(req, res) =>{
    if(req.body.name){
        try{
            const model = new ProjectModel();
            const response = await model.create(req.body);
                
            res.status(HttpStatusCode.Created).send({ ...response, token: req.cookies.token });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                res.status(err.code).send({ message: err.message });
            }else{
                res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when creating project" });
            }
        }
    }else{
        res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

projectRouter.get("/", async(req, res) =>{
    try{
        const model = new ProjectModel();
        const response = await model.all(req.body);
            
        res.status(HttpStatusCode.Ok).send({ ...response, token: req.cookies.token });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            
            res.status(err.code).send({ message: err.message });
        }else{
            res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when getting all projects" });
        }
    }
});

projectRouter.get("/:id", async(req, res) =>{
    if(req.body.id ?? req.query.id){
        try{
            const model = new ProjectModel();
            const response = await model.get({ ...req.body.credential, projectID: req.body.id ?? req.query.id });
                
            res.status(HttpStatusCode.Ok).send({ ...response, token: req.cookies.token });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                
                res.status(err.code).send({ message: err.message });
            }else{
                res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when getting project details" });
            }
        }
    }else{
        res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default projectRouter;