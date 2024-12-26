import express, { NextFunction, Request, Response } from "express";
import chatRouter from "./chat";
import friendRouter from "./friends";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import jetLogger from "jet-logger";
import AccessKeyModel from "../models/access-keys";
import authRouter from "./auth";
import accessKeyRouter from "./access-keys";
import { AdminModel, OrganizationModel } from "../models";
import { Err, SeedResult } from "../config";
import { Credential, Project } from "@prisma/client";
import ClientModel from "../models/clients";
import DeveloperModel from "../models/developer";
import projectRouter from "./projects";

export const KeyAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.key || req.query.key){
        try{
            const accessKey = await new AccessKeyModel().get(req.body.key ?? req.query.key);

            console.log(`${req.body.key ?? req.query.key} - ${JSON.stringify(accessKey)}`);
            if(accessKey.enabled){            
                req.body.project = accessKey.project;
                req.body.owner = accessKey.project.owner;
                if(req.body.organization || req.query.organization){
                    const organizationName = req.body.organization ?? req.query.organization;
                    req.body.organization = await new OrganizationModel().get({ project: accessKey.project, name: organizationName });
                }
                return next()
            }else{
                return res.status(HttpStatusCode.Unauthorized).send({message: "API Access key found but has been deactivated" });
            }
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const init = error as Err;
                return res.send(init.code).send({ message: init.message });
            }else{
                return res.status(HttpStatusCode.InternalServerError).send({message: "error encountered when authenticating acess key"});
            }
        }
    }
    return res.status(HttpStatusCode.Unauthorized).send({message: "access key not found expired"});
};

export const APIAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token){
        try{
            req.body.credential = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).credential;
    
            return next()
        }catch(error){
            jetLogger.err(error);
            if(error instanceof jwt.TokenExpiredError){
                return res.status(HttpStatusCode.Unauthorized).send({message: "access token expired, try refreshing or login again"});
            }else{
                return res.status(HttpStatusCode.InternalServerError).send({message: "error encountered when authenticating user"});
            }
        }
    }
    return res.status(HttpStatusCode.Unauthorized).send({message: "access token expired, try refreshing or login again"});
};

export const AdminFilter = async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.credential && (req.body.credential as Credential).role === "Admin"){
        const credential = (req.body.credential as Credential);
        const project = (req.body.project as Project);

        const seedResult = SeedResult.instance();

        if(seedResult.projectID === project.id && project.ownerID === credential.id){
            return next()
        }else{
            return res.status(HttpStatusCode.Unauthorized).send({message: "You don't have addministrative access" });
        }
    }
    return res.status(HttpStatusCode.Unauthorized).send({message: "You don't have permission to access this route" });
};

export const DeveloperFilter = async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.credential && (req.body.credential as Credential).role !== "Client"){
        const project = (req.body.project as Project);

        const seedResult = SeedResult.instance();
        if(seedResult.projectID === project.id){
            return next()
        }else{
            return res.status(HttpStatusCode.Unauthorized).send({message: "You don't have developer access" });
        }
    }
    return res.status(HttpStatusCode.Unauthorized).send({message: "You don't have permission to access this route" });
};

const api = express.Router();

const projectAPI = express.Router();
projectAPI.use("/", projectRouter);
projectAPI.use("/access-key", accessKeyRouter);

const adminAPI = express.Router();

api.use("/project", KeyAuthenication, APIAuthenication, DeveloperFilter, projectAPI);
api.use("/admin", KeyAuthenication, APIAuthenication, AdminFilter, adminAPI);

api.use("/chats", KeyAuthenication, APIAuthenication, chatRouter);
api.use("/friends", KeyAuthenication, APIAuthenication, friendRouter);

api.use("/auth", KeyAuthenication, authRouter);
api.get("/", KeyAuthenication, APIAuthenication, async(req, res) =>{
    try{
        let model: ClientModel | DeveloperModel | AdminModel =  new ClientModel();
        switch((req.body.credential as Credential).role){
            case "Admin":
                model = new AdminModel();
                break;
            case "Developer":
                model = new DeveloperModel();
                break;
        }
        const init = await model.get(req.body);

        return res.status(HttpStatusCode.Ok).send({ ...init, token: req.cookies.token });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return res.status(err.code).send({ message: err.message });
        }
        return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when creating user" });
    }
});

export default api;