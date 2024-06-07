import express, { NextFunction, Request, Response } from "express";
import chatRouter from "./chat";
import friendRouter from "./friends";
import userRouter from "./users";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import jetLogger from "jet-logger";
import AccessKeyModel from "../models/access-keys";
import authRouter from "./auth";
import developerRouter from "./developer";
import accessKeyRouter from "./access-keys";
import { OrganizationModel } from "../models";

export const UserAPIAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token && (req.body.key || req.query.key)){
        try{
            req.body.user = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).user;
    
            const accessKey = await new AccessKeyModel().get(req.body.key || req.query.key);
            if(accessKey?.enabled){            
                req.body.project = accessKey.project;
                if(req.body.organization || req.query.organization){
                    const organizationName = req.body.organization || req.query.organization;
                    const organization = await new OrganizationModel().get({ project: accessKey.project, name: organizationName });
                    if(organization){
                        req.body.organization = organization;
                        return next();
                    }
                    return res.status(HttpStatusCode.NotFound).send({message: "Organization specified not found" });
                }
                return next()
            }
            return res.status(HttpStatusCode.Unauthorized).send({message: "API Access key found but has been deactivated" });
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

export const DeveloperAPIAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token){
        try{
            req.body.developer = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).developer;

            return next();
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

const api = express.Router();

api.use("/chats", UserAPIAuthenication, chatRouter);
api.use("/friends", UserAPIAuthenication, friendRouter);
api.use("/users", UserAPIAuthenication, userRouter);

api.use("/developer", DeveloperAPIAuthenication, developerRouter);
api.use("/access-key", DeveloperAPIAuthenication, accessKeyRouter);

api.use("/auth", authRouter);

export default api;