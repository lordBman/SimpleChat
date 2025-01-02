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
                
            return res.status(HttpStatusCode.Created).send({ ...response, token: req.cookies.token });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when creating project" });
        }
    }
});

projectRouter.get("/", async(req, res) =>{
    try{
        const model = new ProjectModel();
        const response = await model.all(req.body);
            
        return res.status(HttpStatusCode.Ok).send({ ...response, token: req.cookies.token });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return res.status(err.code).send({ message: err.message });
        }
        return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when getting all projects" });
    }
});

projectRouter.get("/:id", async(req, res) =>{
    if(req.body.id ?? req.query.id){
        try{
            const model = new ProjectModel();
            const response = await model.get({ ...req.body.credential, projectID: req.body.id ?? req.query.id });
                
            return res.status(HttpStatusCode.Ok).send({ ...response, token: req.cookies.token });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when getting project details" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

export default projectRouter;